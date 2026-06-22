const url = "https://script.google.com/macros/s/AKfycbyWzzvHJqNjo-lQhlqW_fZEPMRx8jxlcmQVjBBFwghoXra4JhSG2kYgrg7u5L9PIyqi/exec";

const payload = {
  id: "test_from_node",
  firstName: "ทดสอบ",
  lastName: "ระบบ",
  assessDate: "2026-06-22",
  score: 0,
  selectedItems: "ไม่มี",
  levelLabel: "ปกติ",
  recommendation: "test",
  createdAt: new Date().toISOString()
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
  body: JSON.stringify(payload),
})
.then(res => {
  console.log("Status Code:", res.status);
  return res.text();
})
.then(text => console.log("Response Body:", text))
.catch(err => console.error("Fetch Error:", err));
