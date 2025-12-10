import Artifact from "../../interfaces/artifactModelInterfaces";
import { findAnyActiveOrCollectedArtifact } from "../../services/artifactServices";

describe('Finds out if there is at least one active or collected artifact in the given array of artifacts', () => {
  describe('When there is more than one active artifact', () => {
    it('should return true', () => {
      // --- ARRANGE --- //
      const artifactsMock: Artifact[] = [
        {
          name: "Ancient Compass",
          coordinates: { x: 120, y: 340 },
          image: "https://example.com/images/artifacts/ancient-compass.png",
          icon: "https://example.com/icons/compass.svg",
          state: "inactive",
        },
        {
          name: "Crystal Skull",
          coordinates: { x: 560, y: 210 },
          image: "https://example.com/images/artifacts/crystal-skull.png",
          icon: "https://example.com/icons/skull.svg",
          state: "active",
        },
        {
          name: "Forgotten Map",
          coordinates: { x: 300, y: 480 },
          image: "https://example.com/images/artifacts/forgotten-map.png",
          icon: "https://example.com/icons/map.svg",
          state: "inactive",
        },
        {
          name: "Golden Idol",
          coordinates: { x: 720, y: 150 },
          image: "https://example.com/images/artifacts/golden-idol.png",
          icon: "https://example.com/icons/idol.svg",
          state: "inactive",
        },
        {
          name: "Runic Tablet",
          coordinates: { x: 410, y: 360 },
          image: "https://example.com/images/artifacts/runic-tablet.png",
          icon: "https://example.com/icons/tablet.svg",
          state: "active",
        },
        {
          name: "Phantom Lantern",
          coordinates: { x: 90, y: 520 },
          image: "https://example.com/images/artifacts/phantom-lantern.png",
          icon: "https://example.com/icons/lantern.svg",
          state: "active",
        },
        {
          name: "Time Relic",
          coordinates: { x: 640, y: 430 },
          image: "https://example.com/images/artifacts/time-relic.png",
          icon: "https://example.com/icons/time.svg",
          state: "inactive",
        },
        {
          name: "Eternal Feather",
          coordinates: { x: 250, y: 190 },
          image: "https://example.com/images/artifacts/eternal-feather.png",
          icon: "https://example.com/icons/feather.svg",
          state: "active",
        },
      ];

      // --- ACT --- //
      const result = findAnyActiveOrCollectedArtifact(artifactsMock);

      // --- ASSERT --- //
      expect(result).toBe(true);
    });
  });
  
  describe('When there are collected artifacts', () => {
    it('should return false', () => {
      // --- ARRANGE --- //
      const artifactsMock: Artifact[] = [
        {
          name: "Ancient Compass",
          coordinates: { x: 120, y: 340 },
          image: "https://example.com/images/artifacts/ancient-compass.png",
          icon: "https://example.com/icons/compass.svg",
          state: "collected",
        },
        {
          name: "Forgotten Map",
          coordinates: { x: 300, y: 480 },
          image: "https://example.com/images/artifacts/forgotten-map.png",
          icon: "https://example.com/icons/map.svg",
          state: "collected",
        },
        {
          name: "Golden Idol",
          coordinates: { x: 720, y: 150 },
          image: "https://example.com/images/artifacts/golden-idol.png",
          icon: "https://example.com/icons/idol.svg",
          state: "inactive",
        },
        {
          name: "Time Relic",
          coordinates: { x: 640, y: 430 },
          image: "https://example.com/images/artifacts/time-relic.png",
          icon: "https://example.com/icons/time.svg",
          state: "inactive",
        },
      ];

      // --- ACT --- //
      const result = findAnyActiveOrCollectedArtifact(artifactsMock);

      // --- ASSERT --- //
      expect(result).toBe(true);
    });
  });

  describe('When there is more than one active or collected artifact', () => {
    it('should return true', () => {
      // --- ARRANGE --- //
      const artifactsMock: Artifact[] = [
        {
          name: "Ancient Compass",
          coordinates: { x: 120, y: 340 },
          image: "https://example.com/images/artifacts/ancient-compass.png",
          icon: "https://example.com/icons/compass.svg",
          state: "inactive",
        },
        {
          name: "Crystal Skull",
          coordinates: { x: 560, y: 210 },
          image: "https://example.com/images/artifacts/crystal-skull.png",
          icon: "https://example.com/icons/skull.svg",
          state: "active",
        },
        {
          name: "Forgotten Map",
          coordinates: { x: 300, y: 480 },
          image: "https://example.com/images/artifacts/forgotten-map.png",
          icon: "https://example.com/icons/map.svg",
          state: "inactive",
        },
        {
          name: "Golden Idol",
          coordinates: { x: 720, y: 150 },
          image: "https://example.com/images/artifacts/golden-idol.png",
          icon: "https://example.com/icons/idol.svg",
          state: "inactive",
        },
        {
          name: "Runic Tablet",
          coordinates: { x: 410, y: 360 },
          image: "https://example.com/images/artifacts/runic-tablet.png",
          icon: "https://example.com/icons/tablet.svg",
          state: "active",
        },
        {
          name: "Phantom Lantern",
          coordinates: { x: 90, y: 520 },
          image: "https://example.com/images/artifacts/phantom-lantern.png",
          icon: "https://example.com/icons/lantern.svg",
          state: "collected",
        },
        {
          name: "Time Relic",
          coordinates: { x: 640, y: 430 },
          image: "https://example.com/images/artifacts/time-relic.png",
          icon: "https://example.com/icons/time.svg",
          state: "inactive",
        },
        {
          name: "Eternal Feather",
          coordinates: { x: 250, y: 190 },
          image: "https://example.com/images/artifacts/eternal-feather.png",
          icon: "https://example.com/icons/feather.svg",
          state: "active",
        },
      ];

      // --- ACT --- //
      const result = findAnyActiveOrCollectedArtifact(artifactsMock);

      // --- ASSERT --- //
      expect(result).toBe(true);
    });
  });

  describe('When there is not active or collected artifacts', () => {
    it('should return false', () => {
      // --- ARRANGE --- //
      const artifactsMock: Artifact[] = [
        {
          name: "Ancient Compass",
          coordinates: { x: 120, y: 340 },
          image: "https://example.com/images/artifacts/ancient-compass.png",
          icon: "https://example.com/icons/compass.svg",
          state: "inactive",
        },
        {
          name: "Forgotten Map",
          coordinates: { x: 300, y: 480 },
          image: "https://example.com/images/artifacts/forgotten-map.png",
          icon: "https://example.com/icons/map.svg",
          state: "inactive",
        },
        {
          name: "Golden Idol",
          coordinates: { x: 720, y: 150 },
          image: "https://example.com/images/artifacts/golden-idol.png",
          icon: "https://example.com/icons/idol.svg",
          state: "inactive",
        },
        {
          name: "Time Relic",
          coordinates: { x: 640, y: 430 },
          image: "https://example.com/images/artifacts/time-relic.png",
          icon: "https://example.com/icons/time.svg",
          state: "inactive",
        },
      ];

      // --- ACT --- //
      const result = findAnyActiveOrCollectedArtifact(artifactsMock);

      // --- ASSERT --- //
      expect(result).toBe(false);
    });
  });
});