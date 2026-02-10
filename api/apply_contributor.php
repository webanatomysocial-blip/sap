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
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
        exit;
    }
    
    try {
        // Extract expertise array into a JSON string
        $expertise = isset($input['expertise']) ? json_encode($input['expertise']) : '{}';
        $contributionTypes = isset($input['contributionTypes']) ? json_encode($input['contributionTypes']) : '{}';
        
        $stmt = $pdo->prepare("
            INSERT INTO contributor_applications (
                full_name, email, linkedin, country, organization, designation,
                role, expertise, other_expertise, years_experience, short_bio,
                contribution_types, proposed_topics, contributed_elsewhere, previous_work_links,
                preferred_frequency, primary_motivation, weekly_time, volunteer_events,
                product_evaluation, personal_website, twitter_handle, status, created_at
            ) VALUES (
                :full_name, :email, :linkedin, :country, :organization, :designation,
                :role, :expertise, :other_expertise, :years_experience, :short_bio,
                :contribution_types, :proposed_topics, :contributed_elsewhere, :previous_work_links,
                :preferred_frequency, :primary_motivation, :weekly_time, :volunteer_events,
                :product_evaluation, :personal_website, :twitter_handle, 'pending', NOW()
            )
        ");
        
        $stmt->execute([
            ':full_name' => $input['fullName'] ?? '',
            ':email' => $input['email'] ?? '',
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
            ':twitter_handle' => $input['twitterHandle'] ?? ''
        ]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Application submitted successfully',
            'id' => $pdo->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
