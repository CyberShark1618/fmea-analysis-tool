<?php
// Main API Router for Go-Kart Racing App

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'database.php';

// Set CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
}

class APIRouter {
    private $db;
    private $method;
    private $endpoint;
    private $params;

    public function __construct() {
        $this->db = getDB();
        $this->method = $_SERVER['REQUEST_METHOD'];
        
        // Parse the URL
        $request = $_SERVER['REQUEST_URI'];
        $path = parse_url($request, PHP_URL_PATH);
        $path = str_replace('/api.php', '', $path);
        $pathParts = explode('/', trim($path, '/'));
        
        $this->endpoint = $pathParts[0] ?? '';
        $this->params = array_slice($pathParts, 1);
    }

    public function handleRequest() {
        try {
            switch ($this->endpoint) {
                case 'tracks':
                    return $this->handleTracks();
                case 'drivers':
                    return $this->handleDrivers();
                case 'events':
                    return $this->handleEvents();
                case 'race-stats':
                    return $this->handleRaceStats();
                case 'bug-reports':
                    return $this->handleBugReports();
                default:
                    return $this->sendResponse(['error' => 'Endpoint not found'], 404);
            }
        } catch (Exception $e) {
            return $this->sendResponse(['error' => $e->getMessage()], 500);
        }
    }

    private function handleTracks() {
        switch ($this->method) {
            case 'GET':
                if (isset($this->params[0])) {
                    return $this->getTrack($this->params[0]);
                }
                return $this->getAllTracks();
            case 'POST':
                return $this->createTrack();
            case 'PUT':
                if (isset($this->params[0])) {
                    return $this->updateTrack($this->params[0]);
                }
                break;
            case 'DELETE':
                if (isset($this->params[0])) {
                    return $this->deleteTrack($this->params[0]);
                }
                break;
        }
        return $this->sendResponse(['error' => 'Method not allowed'], 405);
    }

    private function handleDrivers() {
        switch ($this->method) {
            case 'GET':
                if (isset($this->params[0])) {
                    return $this->getDriver($this->params[0]);
                }
                return $this->getAllDrivers();
            case 'POST':
                return $this->createDriver();
            case 'PUT':
                if (isset($this->params[0])) {
                    return $this->updateDriver($this->params[0]);
                }
                break;
            case 'DELETE':
                if (isset($this->params[0])) {
                    return $this->deleteDriver($this->params[0]);
                }
                break;
        }
        return $this->sendResponse(['error' => 'Method not allowed'], 405);
    }

    private function handleEvents() {
        switch ($this->method) {
            case 'GET':
                if (isset($this->params[0])) {
                    return $this->getEvent($this->params[0]);
                }
                return $this->getAllEvents();
            case 'POST':
                return $this->createEvent();
            case 'PUT':
                if (isset($this->params[0])) {
                    return $this->updateEvent($this->params[0]);
                }
                break;
            case 'DELETE':
                if (isset($this->params[0])) {
                    return $this->deleteEvent($this->params[0]);
                }
                break;
        }
        return $this->sendResponse(['error' => 'Method not allowed'], 405);
    }

    // Track methods
    private function getAllTracks() {
        $tracks = $this->db->fetchAll("SELECT * FROM tracks ORDER BY created_at DESC");
        return $this->sendResponse($tracks);
    }

    private function getTrack($id) {
        $track = $this->db->fetchOne("SELECT * FROM tracks WHERE id = ?", [$id]);
        if (!$track) {
            return $this->sendResponse(['error' => 'Track not found'], 404);
        }
        return $this->sendResponse($track);
    }

    private function createTrack() {
        $data = $this->getRequestData();
        
        $requiredFields = ['name', 'type', 'price_per_person'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->sendResponse(['error' => "Missing required field: $field"], 400);
            }
        }

        $trackData = [
            'name' => $data['name'],
            'address' => $data['address'] ?? null,
            'type' => $data['type'],
            'price_per_person' => (int)$data['price_per_person'],
            'description' => $data['description'] ?? null,
            'created_by' => $data['created_by'] ?? 'Unknown'
        ];

        $id = $this->db->insert('tracks', $trackData);
        $track = $this->db->fetchOne("SELECT * FROM tracks WHERE id = ?", [$id]);
        
        return $this->sendResponse($track, 201);
    }

    private function updateTrack($id) {
        $data = $this->getRequestData();
        
        $updateData = [];
        $allowedFields = ['name', 'address', 'type', 'price_per_person', 'description'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            return $this->sendResponse(['error' => 'No valid fields to update'], 400);
        }

        $rowsAffected = $this->db->update('tracks', $updateData, 'id = ?', [$id]);
        
        if ($rowsAffected === 0) {
            return $this->sendResponse(['error' => 'Track not found'], 404);
        }

        $track = $this->db->fetchOne("SELECT * FROM tracks WHERE id = ?", [$id]);
        return $this->sendResponse($track);
    }

    private function deleteTrack($id) {
        $rowsAffected = $this->db->delete('tracks', 'id = ?', [$id]);
        
        if ($rowsAffected === 0) {
            return $this->sendResponse(['error' => 'Track not found'], 404);
        }

        return $this->sendResponse(['message' => 'Track deleted successfully']);
    }

    // Driver methods
    private function getAllDrivers() {
        $sql = "
            SELECT d.*, ds.races, ds.wins, ds.podiums, ds.fastest_laps, ds.points
            FROM drivers d
            LEFT JOIN driver_stats ds ON d.id = ds.driver_id
            ORDER BY d.created_at DESC
        ";
        $drivers = $this->db->fetchAll($sql);
        
        // Format the response to match the frontend structure
        foreach ($drivers as &$driver) {
            $driver['stats'] = [
                'races' => (int)($driver['races'] ?? 0),
                'wins' => (int)($driver['wins'] ?? 0),
                'podiums' => (int)($driver['podiums'] ?? 0),
                'fastestLaps' => (int)($driver['fastest_laps'] ?? 0),
                'points' => (int)($driver['points'] ?? 0)
            ];
            unset($driver['races'], $driver['wins'], $driver['podiums'], $driver['fastest_laps'], $driver['points']);
        }
        
        return $this->sendResponse($drivers);
    }

    private function getDriver($id) {
        $sql = "
            SELECT d.*, ds.races, ds.wins, ds.podiums, ds.fastest_laps, ds.points
            FROM drivers d
            LEFT JOIN driver_stats ds ON d.id = ds.driver_id
            WHERE d.id = ?
        ";
        $driver = $this->db->fetchOne($sql, [$id]);
        
        if (!$driver) {
            return $this->sendResponse(['error' => 'Driver not found'], 404);
        }

        $driver['stats'] = [
            'races' => (int)($driver['races'] ?? 0),
            'wins' => (int)($driver['wins'] ?? 0),
            'podiums' => (int)($driver['podiums'] ?? 0),
            'fastestLaps' => (int)($driver['fastest_laps'] ?? 0),
            'points' => (int)($driver['points'] ?? 0)
        ];
        unset($driver['races'], $driver['wins'], $driver['podiums'], $driver['fastest_laps'], $driver['points']);
        
        return $this->sendResponse($driver);
    }

    private function createDriver() {
        $data = $this->getRequestData();
        
        if (!isset($data['name'])) {
            return $this->sendResponse(['error' => 'Missing required field: name'], 400);
        }

        $driverData = [
            'name' => $data['name'],
            'nickname' => $data['nickname'] ?? null,
            'bio' => $data['bio'] ?? null,
            'created_by' => $data['created_by'] ?? 'Unknown'
        ];

        $id = $this->db->insert('drivers', $driverData);
        $driver = $this->getDriver($id);
        
        return $this->sendResponse($driver->getData(), 201);
    }

    private function updateDriver($id) {
        $data = $this->getRequestData();
        
        $updateData = [];
        $allowedFields = ['name', 'nickname', 'bio'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            return $this->sendResponse(['error' => 'No valid fields to update'], 400);
        }

        $rowsAffected = $this->db->update('drivers', $updateData, 'id = ?', [$id]);
        
        if ($rowsAffected === 0) {
            return $this->sendResponse(['error' => 'Driver not found'], 404);
        }

        $driver = $this->getDriver($id);
        return $this->sendResponse($driver->getData());
    }

    private function deleteDriver($id) {
        $rowsAffected = $this->db->delete('drivers', 'id = ?', [$id]);
        
        if ($rowsAffected === 0) {
            return $this->sendResponse(['error' => 'Driver not found'], 404);
        }

        return $this->sendResponse(['message' => 'Driver deleted successfully']);
    }

    // Helper methods
    private function getRequestData() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    private function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }

    // Placeholder methods for other endpoints
    private function handleRaceStats() {
        return $this->sendResponse(['message' => 'Race stats endpoint not implemented yet']);
    }

    private function handleBugReports() {
        return $this->sendResponse(['message' => 'Bug reports endpoint not implemented yet']);
    }

    private function getAllEvents() {
        $events = $this->db->fetchAll("SELECT * FROM events ORDER BY created_at DESC");
        
        // Parse JSON fields
        foreach ($events as &$event) {
            $event['proposed_dates'] = json_decode($event['proposed_dates'] ?? '[]', true);
            $event['votes'] = json_decode($event['votes'] ?? '{}', true);
            $event['participants'] = json_decode($event['participants'] ?? '[]', true);
        }
        
        return $this->sendResponse($events);
    }

    private function createEvent() {
        $data = $this->getRequestData();
        
        $requiredFields = ['title', 'description'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->sendResponse(['error' => "Missing required field: $field"], 400);
            }
        }

        $eventData = [
            'title' => $data['title'],
            'description' => $data['description'],
            'track_id' => $data['track_id'] ?? null,
            'status' => $data['status'] ?? 'planning',
            'proposed_dates' => json_encode($data['proposed_dates'] ?? []),
            'votes' => json_encode($data['votes'] ?? []),
            'participants' => json_encode($data['participants'] ?? []),
            'created_by' => $data['created_by'] ?? 'Unknown'
        ];

        $id = $this->db->insert('events', $eventData);
        $event = $this->db->fetchOne("SELECT * FROM events WHERE id = ?", [$id]);
        
        // Parse JSON fields for response
        $event['proposed_dates'] = json_decode($event['proposed_dates'], true);
        $event['votes'] = json_decode($event['votes'], true);
        $event['participants'] = json_decode($event['participants'], true);
        
        return $this->sendResponse($event, 201);
    }

    private function updateEvent($id) {
        $data = $this->getRequestData();
        
        $updateData = [];
        $allowedFields = ['title', 'description', 'track_id', 'status'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        // Handle JSON fields
        if (isset($data['proposed_dates'])) {
            $updateData['proposed_dates'] = json_encode($data['proposed_dates']);
        }
        if (isset($data['votes'])) {
            $updateData['votes'] = json_encode($data['votes']);
        }
        if (isset($data['participants'])) {
            $updateData['participants'] = json_encode($data['participants']);
        }

        if (empty($updateData)) {
            return $this->sendResponse(['error' => 'No valid fields to update'], 400);
        }

        $rowsAffected = $this->db->update('events', $updateData, 'id = ?', [$id]);
        
        if ($rowsAffected === 0) {
            return $this->sendResponse(['error' => 'Event not found'], 404);
        }

        $event = $this->db->fetchOne("SELECT * FROM events WHERE id = ?", [$id]);
        
        // Parse JSON fields for response
        $event['proposed_dates'] = json_decode($event['proposed_dates'], true);
        $event['votes'] = json_decode($event['votes'], true);
        $event['participants'] = json_decode($event['participants'], true);
        
        return $this->sendResponse($event);
    }

    private function deleteEvent($id) {
        $rowsAffected = $this->db->delete('events', 'id = ?', [$id]);
        
        if ($rowsAffected === 0) {
            return $this->sendResponse(['error' => 'Event not found'], 404);
        }

        return $this->sendResponse(['message' => 'Event deleted successfully']);
    }
}

// Initialize and handle the request
$router = new APIRouter();
$router->handleRequest();
?>
