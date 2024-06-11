"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    // await queryInterface.bulkInsert(
    //   "DeviceInventories",
    //   [
    //     {
    //       deviceType: "Card",
    //       deviceColor: "green",
    //       deviceImage: "bubbl/deviceimage/individualcards/green3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1600,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Card",
    //       deviceColor: "red",
    //       deviceImage: "bubbl/deviceimage/individualcards/red3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1600,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Socket",
    //       deviceColor: "green",
    //       deviceImage: "bubbl/deviceimage/individualsockets/green3x.png",
    //       deviceDescription:
    //         "One Socket Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Socket",
    //       deviceColor: "red",
    //       deviceImage: "bubbl/deviceimage/individualsockets/red3x.png",
    //       deviceDescription:
    //         "One Socket Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Tile",
    //       deviceColor: "blue",
    //       deviceImage: "bubbl/deviceimage/individualtiles/blue3x.png",
    //       deviceDescription:
    //         "One Tile Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1000,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Tile",
    //       deviceColor: "red",
    //       deviceImage: "bubbl/deviceimage/individualtiles/red3x.png",
    //       deviceDescription:
    //         "One Tile Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1000,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Bundle Cards",
    //       deviceColor: "green",
    //       deviceImage: "bubbl/deviceimage/bundlecards/green3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 3500,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Bundle Cards",
    //       deviceColor: "red",
    //       deviceImage: "bubbl/deviceimage/bundlecards/red3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 3500,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Bundle Devices",
    //       deviceColor: "blue",
    //       deviceImage: "bubbl/deviceimage/bundledevices/blue3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 3500,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Bundle Devices",
    //       deviceColor: "green",
    //       deviceImage: "bubbl/deviceimage/bundledevices/green3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 3500,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Bamboo",
    //       deviceColor: "red",
    //       deviceImage: "bubbl/deviceimage/bundledevices/green3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Metal",
    //       deviceColor: "black",
    //       deviceImage: "bubbl/deviceimage/tile/red_tile3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Metal",
    //       deviceColor: "Sliver",
    //       deviceImage: "bubbl/deviceimage/tile/red_tile3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "red",
    //       deviceImage: "bubbl/deviceimage/individualcards/green_individual.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "blue",
    //       deviceImage: "bubbl/deviceimage/individualcards/green_individual.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "green",
    //       deviceImage: "bubbl/deviceimage/individualcards/green_individual.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "yellow",
    //       deviceImage: "bubbl/deviceimage/individualcards/green_individual.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "pink",
    //       deviceImage: "bubbl/deviceimage/individualcards/green_individual.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "black",
    //       deviceImage: "bubbl/deviceimage/pop_socket/red_pop_socket.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "grey",
    //       deviceImage: "bubbl/deviceimage/pop_socket/red_pop_socket.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Pattern",
    //       deviceColor: "violet",
    //       deviceImage: "bubbl/deviceimage/pop_socket/red_pop_socket.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Metal",
    //       deviceColor: "grey",
    //       deviceImage: "bubbl/deviceimage/pop_socket/red_pop_socket.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Metal",
    //       deviceColor: "black",
    //       deviceImage: "bubbl/deviceimage/bundledevices/green3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "NC-Bamboo",
    //       deviceColor: "black",
    //       deviceImage: "bubbl/deviceimage/bundledevices/green3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //     {
    //       deviceType: "Fully Custom",
    //       deviceColor: "red",
    //       deviceImage: "bubbl/deviceimage/bundledevices/green3x.png",
    //       deviceDescription:
    //         "One Card Will Last For a Lifetime And Save The Planet More Than You Know",
    //       price: 1200,
    //       availability: true,
    //     },
    //   ],
    //   { fields: ["deviceType", "deviceColor"], ignoreDuplicates: true }
    // );
  },
};
