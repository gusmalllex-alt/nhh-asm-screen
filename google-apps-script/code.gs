function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById("168lddYtJ4qJ055OSM1kqiR50QbDv6jK4jaIbOKgxGOs");
    var sheet = ss.getSheets()[0];
    
    // สร้างหัวตารางกรณีเปิดใช้งานครั้งแรก
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID การประเมิน",
        "ชื่อ",
        "นามสกุล",
        "วันที่ประเมิน",
        "คะแนนที่ได้",
        "อาการคัดกรองที่พบ",
        "ระดับความรุนแรง (สี)",
        "ข้อแนะนำ",
        "เวลาที่บันทึกข้อมูลในระบบ"
      ]);
      sheet.getRange("A1:I1").setFontWeight("bold").setBackground("#e0f2fe");
    }
    
    var action = data.action || 'add';
    
    if (action === 'delete') {
      var targetId = data.id;
      var rows = sheet.getDataRange().getValues();
      var rowIndexToDelete = -1;
      
      // หา Row ที่มี ID ตรงกัน (ข้ามแถวแรกที่เป็น Header)
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === targetId) {
          rowIndexToDelete = i + 1; // getValues เป็น 0-indexed แต่ getRange/deleteRow เป็น 1-indexed
          break;
        }
      }
      
      if (rowIndexToDelete !== -1) {
        sheet.deleteRow(rowIndexToDelete);
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "ลบข้อมูลสำเร็จ"
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("ไม่พบข้อมูลที่ต้องการลบ");
      }
      
    } else if (action === 'update') {
      var targetId = data.id;
      var rows = sheet.getDataRange().getValues();
      var rowIndexToUpdate = -1;
      
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === targetId) {
          rowIndexToUpdate = i + 1;
          break;
        }
      }
      
      if (rowIndexToUpdate !== -1) {
        // อัปเดตข้อมูลในแถวที่เจอ
        var updateRange = sheet.getRange(rowIndexToUpdate, 2, 1, 8); // คอลัมน์ B ถึง I
        updateRange.setValues([[
          data.firstName,
          data.lastName,
          data.assessDate,
          data.score,
          data.selectedItems,
          data.levelLabel,
          data.recommendation,
          data.createdAt // หรือจะใช้วันที่อัปเดตใหม่
        ]]);
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "อัปเดตข้อมูลสำเร็จ"
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("ไม่พบข้อมูลที่ต้องการอัปเดต");
      }
      
    } else {
      // action === 'add' (ค่าเริ่มต้น)
      sheet.appendRow([
        data.id,
        data.firstName,
        data.lastName,
        data.assessDate,
        data.score,
        data.selectedItems,
        data.levelLabel,
        data.recommendation,
        data.createdAt
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกข้อมูลสำเร็จ"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById("168lddYtJ4qJ055OSM1kqiR50QbDv6jK4jaIbOKgxGOs");
    var sheet = ss.getSheets()[0];
    
    if (sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ดึงข้อมูลทั้งหมด
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);
    
    var result = rows.map(function(row) {
      return {
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        assessDate: row[3],
        score: row[4],
        selectedItems: row[5],
        levelLabel: row[6],
        recommendation: row[7],
        createdAt: row[8]
      };
    });
    
    // ถ้ามีการส่งพารามิเตอร์ตรวจสอบรหัสผ่าน
    if (e.parameter.check === 'test') {
       return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
