import { getMortimerContentForAcolyteTowerNotification } from "../../../../helpers/utilities/mqtt/mqttUtilities";

describe("Obtain FCM content for Mortimers notification when an acolytes gets inside / outside the tower:", () => {
  describe("When isAcolyteInsideTower is false and nickname is not empty: ", () => {
    it("should be ['An acolyte goes outside tower!', `The acolyte --acolytesNickname-- has exit the tower.`]", () => {
      //--- ARRANGE ---//
      const acolytesNickname: string = 'Ignatius';
      const isAcolyteInsideTower: boolean = false;
      
      //--- ACT ---//
      const result = getMortimerContentForAcolyteTowerNotification(acolytesNickname, isAcolyteInsideTower);
      
      //--- ASSERT ---//
      // Use .toEqual to compare recursively all properties of object instances (also known as "deep" equality. 
      // It calls Object.is to compare primitive values, which is even better for testing than === strict equality operator.
      expect(result).toEqual(['An acolyte goes outside tower!', `The acolyte Ignatius has exit the tower.`]);
    });
  });

  describe("When isAcolyteInsideTower is true and nickname is not empty: ", () => {
    it("should be ['An acolyte goes inside tower!', `The acolyte --acolytesNickname-- has entered the tower.`]", () => {
      //--- ARRANGE ---//
      const acolytesNickname: string = 'Ignatius';
      const isAcolyteInsideTower: boolean = true;
      
      //--- ACT ---//
      const result = getMortimerContentForAcolyteTowerNotification(acolytesNickname, isAcolyteInsideTower);
      
      //--- ASSERT ---//
      expect(result).toEqual(['An acolyte goes inside tower!', 'The acolyte Ignatius has entered the tower.']);
    });
  });

  describe("When acolytesNickname is empty and isAcolyteInsideTower true: ", () => {
    it("should be ['An acolyte goes inside tower!', `An acolyte without nickname has entered the tower.`]", () => {
      //--- ARRANGE ---//
      const acolytesNickname: string = '';
      const isAcolyteInsideTower: boolean = true;
      
      //--- ACT ---//
      const result = getMortimerContentForAcolyteTowerNotification(acolytesNickname, isAcolyteInsideTower);
      
      //--- ASSERT ---//
      expect(result).toEqual(['An acolyte goes inside tower!', `An acolyte without nickname has entered the tower.`]);
    });
  });

  describe("When acolytesNickname is empty and isAcolyteInsideTower false: ", () => {
    it("should be ['An acolyte goes outside tower!', `An acolyte without nickname has exit the tower.`]", () => {
      //--- ARRANGE ---//
      const acolytesNickname: string = '';
      const isAcolyteInsideTower: boolean = false;
      
      //--- ACT ---//
      const result = getMortimerContentForAcolyteTowerNotification(acolytesNickname, isAcolyteInsideTower);
      
      //--- ASSERT ---//
      expect(result).toEqual(['An acolyte goes outside tower!', `An acolyte without nickname has exit the tower.`]);
    });
  });

});