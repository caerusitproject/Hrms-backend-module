const upload = require("../services/uploadService")
const fs = require("fs");

exports.uploadFile = async (req, res) => {
  try {
    const { id } = req.params; 
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error:400, message: "No file uploaded" });
    }
    if(!id){return res.status(400).json({error:400, message:"no id provided"});}

    const fileRecord =  await upload.saveFile({
      employee_id: id,
      file_path: file.path,
      file_type: file.mimetype,
    });
     
    if (!fs.existsSync(fileRecord.file_path)) {
    return res.status(404).send("Image not found");
  }


    return res.status(201).json({
      message: "File uploaded successfully",
      file: fileRecord,
    });
  } catch (err) {
    return res.status(500).json({ error:500, message: err.message });
  }
};


exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params; 
    const file = req.file;     
    const uploadedBy=req.user.id;
    // Validate inputs
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Employee ID not provided in URL.",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded.",
      });
    }

    // Get other fields from form-data (text fields)
    const { title, content, type } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: "Please provide both 'title' and 'type' for the document.",
      });
    }

    // Save document record
    const document = await upload.saveDocFile({
      employee_id: id,
      title,
      content,
      type,
      file_path: file.path,
      file_type: file.mimetype,
      uploadedBy
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully!",
      document,
    });
  } catch (err) {
    console.error("Error uploading document:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error.",
    });
  }
};





exports.getFiles = async (req, res) => {
  try {
    const  empId  = req.user.empId;
    const files = await upload.getFilesByEmployee(empId);

       


    return res.status(200).json(files);
  } catch (err) {
    return res.status(500).json({ error:500, message: err.message });
  }
};

exports.getDoc = async (req,res) =>{
  try{
    const {id} = req.params;
    const files = await upload.getDocByEmployee(id);
    return res.status(200).json(files);
  }catch(err){
    return res.status(500).json({error:500, message:err.message});
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { fileId } = req.params;
    const deleted = await upload.deleteImage(fileId);

    if (!deleted) {
      return res.status(404).json({ error:404, message: "Profile Image not found" });
    }

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error:500,message: err.message });
  }
};


exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const deleted = await upload.deleteFile(fileId);

    if (!deleted) {
      return res.status(404).json({ error:404, message: "File not found" });
    }

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error:500,message: err.message });
  }
};