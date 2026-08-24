import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { numberToVietnameseWords } from "../src/utils/numberToVietnameseWords";

describe("numberToVietnameseWords", () => {
  it("reads zero", () => {
    assert.equal(numberToVietnameseWords(0), "Không đồng");
  });

  it("reads small amounts", () => {
    assert.equal(numberToVietnameseWords(1), "Một đồng");
    assert.equal(numberToVietnameseWords(15), "Mười lăm đồng");
    assert.equal(numberToVietnameseWords(21), "Hai mươi mốt đồng");
    assert.equal(numberToVietnameseWords(24), "Hai mươi tư đồng");
    assert.equal(numberToVietnameseWords(105), "Một trăm lẻ năm đồng");
  });

  it("reads thousands used on the create-screen sketch", () => {
    assert.equal(numberToVietnameseWords(3330), "Ba nghìn ba trăm ba mươi đồng");
    assert.equal(
      numberToVietnameseWords(2088000),
      "Hai triệu không trăm tám mươi tám nghìn đồng"
    );
  });

  it("reads a mixed total", () => {
    assert.equal(
      numberToVietnameseWords(1234567),
      "Một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy đồng"
    );
  });
});
