const DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

const SCALES = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ"];

function readTriple(n: number, readZeroHundred: boolean): string {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(DIGITS[hundreds], "trăm");
  } else if (readZeroHundred && (tens > 0 || ones > 0)) {
    parts.push("không", "trăm");
  }

  if (tens > 1) {
    parts.push(DIGITS[tens], "mươi");
    if (ones === 1) {
      parts.push("mốt");
    } else if (ones === 4) {
      parts.push("tư");
    } else if (ones === 5) {
      parts.push("lăm");
    } else if (ones > 0) {
      parts.push(DIGITS[ones]);
    }
  } else if (tens === 1) {
    parts.push("mười");
    if (ones === 5) {
      parts.push("lăm");
    } else if (ones > 0) {
      parts.push(DIGITS[ones]);
    }
  } else if (ones > 0) {
    if (hundreds > 0 || readZeroHundred) {
      parts.push("lẻ");
    }
    parts.push(DIGITS[ones]);
  }

  return parts.join(" ");
}

function capitalize(text: string): string {
  if (!text) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function numberToVietnameseWords(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
    throw new Error("Amount must be a non-negative integer");
  }

  if (amount === 0) {
    return "Không đồng";
  }

  const groups: number[] = [];
  let remaining = amount;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const group = groups[i];
    if (group === 0) {
      continue;
    }
    const readZeroHundred = i !== groups.length - 1;
    const words = readTriple(group, readZeroHundred);
    const scale = SCALES[i] ?? "";
    if (scale) {
      parts.push(`${words} ${scale}`);
    } else {
      parts.push(words);
    }
  }

  return `${capitalize(parts.join(" "))} đồng`;
}
