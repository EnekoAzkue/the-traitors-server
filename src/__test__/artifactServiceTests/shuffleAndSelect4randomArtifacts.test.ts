import { shuffleAndSelect4randomArtifacts } from "../../services/artifactServices";
import Artifact from "../../interfaces/artifactModelInterfaces";

describe('Selects a sub set of 4 artifacts of the given ones', () => {
  describe('When you pass more than 4 artifacts ', () => {
    it('returns an array of 4 artifacts', () => {
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
          state: "locked",
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
          state: "disabled",
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
      const result = shuffleAndSelect4randomArtifacts(artifactsMock);

      // --- ASSERT --- //
      expect(result.length).toBe(4);
    });
  });

    describe('When you pass exactly 4 artifacts ', () => {
    it('returns an array of 4 artifacts', () => {
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
          state: "locked",
        },
        {
          name: "Golden Idol",
          coordinates: { x: 720, y: 150 },
          image: "https://example.com/images/artifacts/golden-idol.png",
          icon: "https://example.com/icons/idol.svg",
          state: "inactive",
        },
      ];

      // --- ACT --- //
      const result = shuffleAndSelect4randomArtifacts(artifactsMock);

      // --- ASSERT --- //
      expect(result.length).toBe(4);
    });
  });

      describe('When you pass less than 4 artifacts ', () => {
    it('returns an array of 4 artifacts', () => {
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
      ];

      // --- ACT && ASSERT --- //
      expect( () => shuffleAndSelect4randomArtifacts(artifactsMock)).toThrow();
    });
  });
});