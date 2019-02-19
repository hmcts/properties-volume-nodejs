import { Properties } from "../src";

describe("Azure flex vault module should start up", () => {
  test("should start up ", () => {
      Properties.configure();
    }
  );
});
