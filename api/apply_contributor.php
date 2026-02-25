<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if it's a multipart form data request (file upload) or JSON
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
    } else {
        $input = $_POST;
    }
    
    if (!$input) {
        echo json_encode(['status' => 'error', 'message' => 'Please provide all required application details.']);
        exit;
    }
    
    try {
// Handle File Upload
        $imagePath = null; // Default to null if no image or upload fails
        
        if (isset($_FILES['profilePhoto']) && $_FILES['profilePhoto']['error'] === UPLOAD_ERR_OK) {
            // FIX: Use public/assets path for web accessibility
            $isLocal = strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false || strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false;
            $uploadDir = $isLocal ? __DIR__ . '/../public/uploads/contributors/' : __DIR__ . '/../uploads/contributors/';
            
            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $fileTmpPath = $_FILES['profilePhoto']['tmp_name'];
            $fileName = basename($_FILES['profilePhoto']['name']);
            $fileSize = $_FILES['profilePhoto']['size'];
            $fileType = $_FILES['profilePhoto']['type'];
            
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));
            
            // Security: Allow specific extensions
            $allowedfileExtensions = array('jpg', 'gif', 'png', 'webp', 'jpeg');
            
            // Security: Enforce size limit (e.g., 5MB)
            if ($fileSize > 5 * 1024 * 1024) {
                 echo json_encode(['status' => 'error', 'message' => 'The profile picture is too large. Please upload an image smaller than 5MB.']);
                 exit;
            }

            // Validate image dimensions and squareness
            $imageInfo = getimagesize($fileTmpPath);
            if ($imageInfo === false) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid image file.']);
                exit;
            }

            $width = $imageInfo[0];
            $height = $imageInfo[1];

            if ($width < 300 || $height < 300) {
                echo json_encode(['status' => 'error', 'message' => 'Profile image must be at least 300x300 pixels.']);
                exit;
            }

            if (abs($width - $height) > 5) {
                echo json_encode(['status' => 'error', 'message' => 'Profile image must be square (1:1 ratio).']);
                exit;
            }

            if (in_array($fileExtension, $allowedfileExtensions)) {
                // Security: Unique filename to prevent overwrites
                $newFileName = 'contributor_' . uniqid() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExtension;
                $dest_path = $uploadDir . $newFileName;
                
                if(move_uploaded_file($fileTmpPath, $dest_path)) {
                    // Store relative path for frontend usage
                    $imagePath = '/uploads/contributors/' . $newFileName;
                } else {
                     echo json_encode(['status' => 'error', 'message' => 'Something went wrong while saving your profile picture. Please try again.']);
                     exit;
                }
            } else {
                 echo json_encode(['status' => 'error', 'message' => 'Please upload a valid image file (JPG, PNG, or WEBP).']);
                 exit;
            }
        }

        // Extract expertise array into a JSON string
        // If input came from FormData, arrays might be passed as strings or individual keys?
        // In the React app: payload.append("expertise", JSON.stringify(formData[key]));
        $expertise = isset($input['expertise']) ? $input['expertise'] : '{}';
        // If it was posted as JSON string (from FormData), we keep it as is.
        // If it was posted as array (from JSON body), we json_encode it.
        if (is_array($expertise)) {
            $expertise = json_encode($expertise);
        }

        $contributionTypes = isset($input['contributionTypes']) ? $input['contributionTypes'] : '{}';
        if (is_array($contributionTypes)) {
            $contributionTypes = json_encode($contributionTypes);
        }
        
        $email = $input['email'] ?? '';
        
        $checkStmt = $pdo->prepare("SELECT id, status, image FROM contributors WHERE email = ?");
        $checkStmt->execute([$email]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            if ($existing['status'] === 'rejected') {
                // Delete old image if a new one is being uploaded
                if (!empty($imagePath) && !empty($existing['image']) && $existing['image'] !== $imagePath) {
                    deleteImage($existing['image']);
                }

                // Update existing record
                $stmt = $pdo->prepare("
                    UPDATE contributors SET 
                        full_name = :full_name, linkedin = :linkedin, country = :country, 
                        organization = :organization, designation = :designation,
                        role = :role, expertise = :expertise, other_expertise = :other_expertise, 
                        years_experience = :years_experience, short_bio = :short_bio,
                        contribution_types = :contribution_types, proposed_topics = :proposed_topics, 
                        contributed_elsewhere = :contributed_elsewhere, previous_work_links = :previous_work_links,
                        preferred_frequency = :preferred_frequency, primary_motivation = :primary_motivation, 
                        weekly_time = :weekly_time, volunteer_events = :volunteer_events,
                        product_evaluation = :product_evaluation, personal_website = :personal_website, 
                        twitter_handle = :twitter_handle, image = COALESCE(:image, image), 
                        status = 'pending', created_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                ");
                
                $stmt->execute([
                    ':full_name' => $input['fullName'] ?? '',
                    ':linkedin' => $input['linkedin'] ?? '',
                    ':country' => $input['country'] ?? '',
                    ':organization' => $input['organization'] ?? '',
                    ':designation' => $input['designation'] ?? '',
                    ':role' => $input['role'] ?? '',
                    ':expertise' => $expertise,
                    ':other_expertise' => $input['otherExpertiseText'] ?? '',
                    ':years_experience' => $input['yearsExperience'] ?? '',
                    ':short_bio' => $input['shortBio'] ?? '',
                    ':contribution_types' => $contributionTypes,
                    ':proposed_topics' => $input['proposedTopics'] ?? '',
                    ':contributed_elsewhere' => $input['contributedElsewhere'] ?? 'No',
                    ':previous_work_links' => $input['previousWorkLinks'] ?? '',
                    ':preferred_frequency' => $input['preferredFrequency'] ?? 'One-time',
                    ':primary_motivation' => $input['primaryMotivation'] ?? '',
                    ':weekly_time' => $input['weeklyTime'] ?? '',
                    ':volunteer_events' => $input['volunteerEvents'] ?? 'No',
                    ':product_evaluation' => $input['productEvaluation'] ?? 'No',
                    ':personal_website' => $input['personalWebsite'] ?? '',
                    ':twitter_handle' => $input['twitterHandle'] ?? '',
                    ':image' => $imagePath,
                    ':id' => $existing['id']
                ]);

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Application re-submitted successfully',
                    'id' => $existing['id']
                ]);
                exit;
            } else {
                echo json_encode([
                    'status' => 'error', 
                    'message' => 'An application with this email already exists and is ' . $existing['status'] . '.'
                ]);
                exit;
            }
        }

        // Prepare SQL for new record
        $stmt = $pdo->prepare("
            INSERT INTO contributors (
                full_name, email, linkedin, country, organization, designation,
                role, expertise, other_expertise, years_experience, short_bio,
                contribution_types, proposed_topics, contributed_elsewhere, previous_work_links,
                preferred_frequency, primary_motivation, weekly_time, volunteer_events,
                product_evaluation, personal_website, twitter_handle, image, status, created_at
            ) VALUES (
                :full_name, :email, :linkedin, :country, :organization, :designation,
                :role, :expertise, :other_expertise, :years_experience, :short_bio,
                :contribution_types, :proposed_topics, :contributed_elsewhere, :previous_work_links,
                :preferred_frequency, :primary_motivation, :weekly_time, :volunteer_events,
                :product_evaluation, :personal_website, :twitter_handle, :image, 'pending', CURRENT_TIMESTAMP
            )
        ");
        
        $stmt->execute([
            ':full_name' => $input['fullName'] ?? '',
            ':email' => $email,
            ':linkedin' => $input['linkedin'] ?? '',
            ':country' => $input['country'] ?? '',
            ':organization' => $input['organization'] ?? '',
            ':designation' => $input['designation'] ?? '',
            ':role' => $input['role'] ?? '',
            ':expertise' => $expertise,
            ':other_expertise' => $input['otherExpertiseText'] ?? '',
            ':years_experience' => $input['yearsExperience'] ?? '',
            ':short_bio' => $input['shortBio'] ?? '',
            ':contribution_types' => $contributionTypes,
            ':proposed_topics' => $input['proposedTopics'] ?? '',
            ':contributed_elsewhere' => $input['contributedElsewhere'] ?? 'No',
            ':previous_work_links' => $input['previousWorkLinks'] ?? '',
            ':preferred_frequency' => $input['preferredFrequency'] ?? 'One-time',
            ':primary_motivation' => $input['primaryMotivation'] ?? '',
            ':weekly_time' => $input['weeklyTime'] ?? '',
            ':volunteer_events' => $input['volunteerEvents'] ?? 'No',
            ':product_evaluation' => $input['productEvaluation'] ?? 'No',
            ':personal_website' => $input['personalWebsite'] ?? '',
            ':twitter_handle' => $input['twitterHandle'] ?? '',
            ':image' => $imagePath 
        ]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Application submitted successfully',
            'id' => $pdo->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Something went wrong while processing your application. Please try again later.'
        ]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
