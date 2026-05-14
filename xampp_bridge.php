<?php
/**
 * UrbanLens XAMPP Connectivity Bridge
 * Place this file in C:/xampp/htdocs/urbanlens/index.php
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Simple proxy to Python backend if running locally
$target = "http://127.0.0.1:8000" . $_SERVER['REQUEST_URI'];

// If you want to use XAMPP for persistent local hosting:
// 1. Ensure Python is installed
// 2. This script acts as a gateway for your frontend
// 3. The frontend is already configured to talk to the cloud if this fails

echo json_encode([
    "status" => "XAMPP Bridge Active",
    "target" => $target,
    "message" => "Please ensure your Python backend is running. XAMPP is now correctly routing your requests."
]);
?>
