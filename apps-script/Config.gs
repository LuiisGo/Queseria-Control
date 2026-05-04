var CONFIG = {
  SECRET_PROPERTY: "APP_SECRET",
  SPREADSHEET_ID_PROPERTY: "SPREADSHEET_ID",
  TIMEZONE: "America/Guatemala",
  DEFAULT_ADMIN_USER: "admin",
  DEFAULT_ADMIN_PASSWORD: "admin123"
};

var SHEETS = {
  Settings: ["Key", "Value", "Description", "Updated_At"],
  Users: ["ID", "Name", "Username", "Password_Hash", "Password_Salt", "Role", "Active", "Created_At", "Updated_At"],
  User_Branches: ["ID", "User_ID", "Branch_ID", "Created_At"],
  Permissions: ["ID", "User_ID", "Permission", "Enabled", "Updated_At"],
  Branches: ["ID", "Name", "Type", "Address", "Active", "Notes", "Created_At", "Updated_At"],
  Products: ["ID", "Code", "Name", "Image_Url", "Unit", "Presentation", "Category", "Final_Price", "Distributor_Price", "Production_Cost", "Min_Stock", "Branch_Min_Stock_JSON", "Active", "Created_At", "Updated_At"],
  Product_Prices: ["ID", "Product_ID", "Price_Type", "Scope_Type", "Scope_ID", "Price", "Active", "Updated_At"],
  Price_History: ["ID", "Product_ID", "Price_Type", "Scope_Type", "Scope_ID", "Old_Price", "New_Price", "User_ID", "Changed_At", "Notes"],
  Distributors: ["ID", "Name", "Phone", "Email", "Address", "Active", "Special_Prices_JSON", "Notes", "Created_At", "Updated_At"],
  Inventory: ["ID", "Product_ID", "Branch_ID", "Quantity", "Min_Stock", "Updated_At"],
  Inventory_Lots: ["ID", "Product_ID", "Branch_ID", "Lot_Number", "Expiration_Date", "Quantity", "Notes", "Created_At", "Updated_At"],
  Production: ["ID", "Date", "User_ID", "Branch_ID", "Product_ID", "Quantity", "Unit_Cost", "Lot_Number", "Expiration_Date", "Notes"],
  Transfers: ["ID", "Date", "User_ID", "Origin_Branch_ID", "Destination_Branch_ID", "Status", "Difference_Note", "Notes"],
  Transfer_Items: ["ID", "Transfer_ID", "Product_ID", "Quantity", "Lot_ID", "Sent_Quantity", "Received_Quantity", "Difference"],
  Sales: ["ID", "Date", "User_ID", "Branch_ID", "Customer_Type", "Distributor_ID", "Payment_Method", "Subtotal", "Discount_Total", "Total", "Estimated_Cost", "Estimated_Profit", "Status", "Notes"],
  Sale_Items: ["ID", "Sale_ID", "Product_ID", "Quantity", "Price", "Discount", "Subtotal", "Lot_ID"],
  Credits: ["ID", "Distributor_ID", "Sale_ID", "Total_Amount", "Paid_Amount", "Balance", "Sale_Date", "Due_Date", "Status"],
  Credit_Payments: ["ID", "Credit_ID", "Date", "User_ID", "Amount", "Payment_Method", "Note"],
  Waste: ["ID", "Date", "User_ID", "Branch_ID", "Product_ID", "Lot_ID", "Quantity", "Reason", "Notes"],
  Returns: ["ID", "Date", "User_ID", "Branch_ID", "Product_ID", "Quantity", "Reason", "Reusable", "Waste_ID", "Note"],
  Stock_Adjustments: ["ID", "Date", "User_ID", "Branch_ID", "Product_ID", "Old_Quantity", "New_Quantity", "Reason", "Notes"],
  Correction_Requests: ["ID", "Record_ID", "Record_Type", "Reason", "Current_Value_JSON", "Requested_Value_JSON", "User_ID", "Date", "Status", "Reviewed_By", "Reviewed_At", "Review_Note"],
  Daily_Closings: ["ID", "Date", "Branch_ID", "User_ID", "System_Total", "Cash_Reported", "Transfer_Reported", "Card_Reported", "Credit_Reported", "Difference", "Status", "Notes"],
  Notifications: ["ID", "Date", "Type", "Title", "Message", "Target_Role", "Target_User_ID", "Read", "Email_Sent"],
  Audit_Log: ["ID", "Date", "User_ID", "Role", "Action", "Module", "Record_ID", "Old_Data_JSON", "New_Data_JSON", "IP", "User_Agent", "Note"]
};
