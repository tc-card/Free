function findRow(identifier, byId = false) {
  // Access spreadsheet directly - NO CACHING
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Form');
  if (!sheet) throw new Error('Form sheet not found');

  // Get fresh data every time
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return null; // No data rows
  
  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  
  // Clean and normalize identifier
  const cleanIdentifier = identifier.trim().toLowerCase();
  const columnName = byId ? 'ID' : 'Link';
  const columnIndex = headers.findIndex(h => h.toString().trim() === columnName);
  if (columnIndex === -1) throw new Error(`${columnName} column not found`);

  // Search for match - always fresh data
  for (let i = 1; i < data.length; i++) {
    const rowValue = String(data[i][columnIndex]).trim().toLowerCase();
    const toCompare = byId ? cleanIdentifier : cleanIdentifier.replace(/^@/, '');
    
    if (rowValue === toCompare || (!byId && rowValue === `@${toCompare}`)) {
      const responseData = {};
      headers.forEach((header, index) => {
        responseData[header] = data[i][index] !== null ? 
          String(data[i][index]).trim() : '';
      });
      
      // Validate required fields
      if (!responseData.Name) {
        throw new Error('Profile data missing required Name field');
      }
      
      return responseData; // Return fresh data immediately
    }
  }
  
  return null;
}

function doGet(e) {
  try {
    if (!e.parameter) throw new Error('Missing parameters');
    
    // Validate identifier
    const identifier = e.parameter.id || e.parameter.link;
    if (!identifier || typeof identifier !== 'string') {
      throw new Error('Invalid identifier parameter');
    }
    
    // Search for profile - ALWAYS FRESH DATA
    const data = findRow(identifier, !!e.parameter.id);
    if (!data) throw new Error('Profile not found');

    // Prepare response data
    const response = {
      status: 'success',
      data: {
        status: data.Status || 'Active',
        Name: data.Name || '',
        Link: data.Link || '',
        Email: data.Email || '',
        Tagline: data.Tagline || '',
        Phone: data.Phone || '',
        Address: data.Address || '',
        SocialLinks: data.SocialLinks || '',
        Style: data.Style || 'default',
        ProfilePic: data.ProfilePic || 'https://tccards.tn/Assets/150.png',
        Timestamp: new Date().getTime() // Add current timestamp
      }
    };

    // Return response
    const output = ContentService.createTextOutput(
      e.parameter.callback 
        ? `${e.parameter.callback}(${JSON.stringify(response)})`
        : JSON.stringify(response)
    );

    output.setMimeType(
      e.parameter.callback 
        ? ContentService.MimeType.JAVASCRIPT 
        : ContentService.MimeType.JSON
    );

    return output;

  } catch (error) {
    console.error('Error in doGet:', error);
    const errorOutput = ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.message
      })
    );
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
  }
}