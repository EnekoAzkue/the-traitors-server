import { getCardIdFormat } from "../../../../helpers/utilities/mqtt/mqttUtilities";

// /**
//  * Gives the correct format to cardId value deleting unnecesary blank spaces. For example: from  " 32 9B B4 02 " to "329BB402" 
//  * @param msg Unformatted message 
//  * @returns Formatted message
//  */
// export function getCardIdFormat(message: Buffer<ArrayBufferLike>): string {

//   let msg = message.toString();
//   return JSON.parse(msg)?.id.replaceAll(" ", "");
// }


describe("Cast the Buffer value contained in a JSON object to a non blank spaces string:", () => {
  describe("When the contained value has non blank spaces: ", () => {
    it("should be 329BB402", () => {
      //--- ARRANGE ---//
      const value: Buffer<ArrayBufferLike> = Buffer.from('{"id":"329BB402"}');

      //--- ACT ---//
      const result = getCardIdFormat(value);

      //--- ASSERT ---//
      expect(result).toBe("329BB402");
    });
  });

  describe("When the contained value has non blank spaces between content: ", () => {
    it("should be 329BB402", () => {

      //--- ARRANGE ---//
      const value: Buffer<ArrayBufferLike> = Buffer.from('{"id":"32 9B B4 02"}');

      //--- ACT ---//
      const result = getCardIdFormat(value);

      //--- ASSERT ---//

      expect(result).toBe("329BB402");
    });
  });

    describe("When the value is not contained in a JSON: ", () => {
    it("should be 329BB402", () => {

      //--- ARRANGE ---//
      const value: Buffer<ArrayBufferLike> = Buffer.from("329BB402");

      //--- ACT && ASSERT ---//
        // El .toThrow() se utiliza de está manera ya que si fuese como los anteriores test no funcinaría ya que el error ya ha ocurrido antes de llegar a expect() haciendo que test falle.
      expect(() => getCardIdFormat(value)).toThrow();  // Se le puede añadir un argumento con el texto del error, por si se quiere concretar
    });
  });
});