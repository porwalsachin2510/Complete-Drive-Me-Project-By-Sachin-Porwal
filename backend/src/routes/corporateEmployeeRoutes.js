import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    bulkUploadEmployees,
    uploadEmployeesFromCSV,
    getEmployees,
    updateEmployee,
    deleteEmployee,
    getEmployeeAttendance,
    getRouteUtilization,
    approveEmployeeRegistration
} from "../controllers/corporateEmployeeController.js";

const router = express.Router();

// Employee management
router.post("/bulk-upload", verifyToken, bulkUploadEmployees);
router.post("/upload-csv", verifyToken, uploadEmployeesFromCSV);
router.get("/", verifyToken, getEmployees);
router.put("/:employeeId", verifyToken, updateEmployee);
router.delete("/:employeeId", verifyToken, deleteEmployee);
router.post("/approve/:employeeId", verifyToken, approveEmployeeRegistration);

// Reports
router.get("/attendance", verifyToken, getEmployeeAttendance);
router.get("/route-utilization", verifyToken, getRouteUtilization);

export default router;
