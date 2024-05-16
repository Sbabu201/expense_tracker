

const express = require("express");
const { editQuestionController, getAllQuestionController, deleteQuestionController, questionCreateController, questionByIdController } = require("../controllers/questionController");
const router = express.Router();

router.put("/editquestion/:id", editQuestionController);
router.delete("/deletequestion/:id", deleteQuestionController);
router.get("/getallquestion", getAllQuestionController);
router.get("/getquestion/:id", questionByIdController);
router.post("/create", questionCreateController);


module.exports = router;