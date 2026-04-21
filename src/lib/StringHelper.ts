function getLetterByIndex(index: number) {
  if (index < 0 || index > 25) return null; // ngoài phạm vi A-Z
  return String.fromCharCode(65 + index); // 65 là mã ASCII của 'A'
}

function containsVietnameseAccent(str: string) {
  const accentedCharsRegex =
    /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;
  return accentedCharsRegex.test(str.normalize('NFC'));
}

export { getLetterByIndex, containsVietnameseAccent };
