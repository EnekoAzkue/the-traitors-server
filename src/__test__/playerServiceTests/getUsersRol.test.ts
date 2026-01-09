import { EMAIL, PLAYER_ROLES } from "../../helpers/constants/constants";
import { getUsersRol } from "../../services/playerServices";

describe('Get the users rol depending in the email', () => {

  describe('If is Mortimers email', () => {
    it ('Returns the Mortimers rol', () => {
      // --- ARRANGE --- //
      const morimerEmail = EMAIL.MORTIMER;
      
      // --- ACT ---//
      const result = getUsersRol(morimerEmail);
      
      // --- ASSERT --- //
      expect(result).toBe(PLAYER_ROLES.MORTIMER);
    });
  });

  describe('If is Villains email', () => {
    it ('Returns the Villains rol', () => {
      // --- ARRANGE --- //
      const villainEmail = EMAIL.VILLAIN;
      
      // --- ACT ---//
      const result = getUsersRol(villainEmail);
      
      // --- ASSERT --- //
      expect(result).toBe(PLAYER_ROLES.VILLAIN);
    });
  });

  describe('If is Istvans email', () => {
    it ('Returns the Istvans rol', () => {
      // --- ARRANGE --- //
      const istvanEmail = EMAIL.ISTVAN;
      
      // --- ACT ---//
      const result = getUsersRol(istvanEmail);
      
      // --- ASSERT --- //
      expect(result).toBe(PLAYER_ROLES.ISTVAN);
    });
  });

  describe('If the email from an Acolyte', () => {
    it ('Returns the Acolytes rol', () => {
      // --- ARRANGE --- //
      const acolyteEmail = 'ignacio.ayaso@ikasle.aeg.eus';
      
      // --- ACT ---//
      const result = getUsersRol(acolyteEmail);
      
      // --- ASSERT --- //
      expect(result).toBe(PLAYER_ROLES.ACOLYTE);
    });
  });

  describe('If the email from an Acolyte', () => {
    it ('Returns the Acolytes rol', () => {
      // --- ARRANGE --- //
      const notKaotikaEmail = 'ignayh2000@gmail.com'; 
        
      // --- ACT && ASSERT --- //
      expect(() => getUsersRol(notKaotikaEmail)).toThrow();
    });
  });

});