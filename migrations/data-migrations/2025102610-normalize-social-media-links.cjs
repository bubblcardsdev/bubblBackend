"use strict";

module.exports = async (sequelize, Sequelize) => {
  const t = await sequelize.transaction();
  try {
    // 1) Pull rows whose socialMediaName doesn't start with https
    const rows = await sequelize.query(
      `
        SELECT id, profileSocialMediaId, socialMediaName
        FROM ProfileSocialMediaLinks
        WHERE socialMediaName IS NOT NULL
          AND TRIM(socialMediaName) <> ''
          AND LOWER(TRIM(socialMediaName)) NOT LIKE 'https%';
        `,
      { type: Sequelize.QueryTypes.SELECT, transaction: t }
    );

    const isWebsiteLike = (val) => {
      // domain.tld[/...], with or without www., and no spaces
      const s = val.trim();
      if (!s || /\s/.test(s)) return false;
      if (/^www\./i.test(s)) return true;
      // instagram.com/user or example.com
      return /^[a-z0-9.-]+\.[a-z]{2,}(?:[/?#].*)?$/i.test(s);
    };

    const toHttps = (val) => {
      const s = val.trim().replace(/^\/+/, "");
      if (/^https?:\/\//i.test(s)) {
        return s.replace(/^http:\/\//i, "https://");
      }
      return `https://${s}`;
    };

    const buildPlatformUrl = (id, raw) => {
      // remove leading @ and extra slashes
      const clean = raw.trim().replace(/^@/, "").replace(/^\/+/, "");
      switch (id) {
        case 1:
          return `https://www.instagram.com/${clean}`;
        case 2:
          return `https://www.facebook.com/${clean}`;
        case 3:
          return `https://twitter.com/${clean}`;
        case 4:
          return `https://www.youtube.com/${clean}`;
        case 5:
          return `https://www.linkedin.com/in/${clean}`;
        case 6:
          return `https://wa.me/${clean}`;
        default:
          return clean; // fallback (shouldn't happen for 1..6)
      }
    };

    let updatedCount = 0;

    for (const r of rows) {
      const original = (r.socialMediaName || "").trim();
      if (!original) continue;

      let next = original;

      // Upgrade http:// to https:// directly
      if (next.startsWith("http")) {
        next = next;
      } else if (isWebsiteLike(next)) {
        // 3) If it seems to be a website link without http/https, prefix https://
        next = toHttps(next);
      } else {
        // 2) Apply socialLinkRules by platform id (username-like input)
        next = buildPlatformUrl(r.profileSocialMediaId, encodeURIComponent(next));
      }

      if (next !== original) {
        console.log(`Modified urls for id(${r.id}): ${next}`);
        await sequelize.query(
          `
          UPDATE ProfileSocialMediaLinks
          SET socialMediaName = :next, updatedAt = CURRENT_TIMESTAMP
          WHERE id = :id
          `,
          { replacements: { next, id: r.id }, transaction: t }
        );
        updatedCount++;
      }
    }

    console.log(`SocialMediaLinks normalized: ${updatedCount} row(s) updated.`);
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
