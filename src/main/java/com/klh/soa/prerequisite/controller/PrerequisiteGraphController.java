package com.klh.soa.prerequisite.controller;

import com.klh.soa.prerequisite.model.AdaptiveQuizQuestion;
import com.klh.soa.prerequisite.model.LmsWebhookEvent;
import com.klh.soa.prerequisite.model.SkillNode;
import com.klh.soa.prerequisite.service.AdaptiveQuizService;
import com.klh.soa.prerequisite.service.PrerequisiteGraphService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PrerequisiteGraphController {

    private final PrerequisiteGraphService graphService;
    private final AdaptiveQuizService quizService;

    public PrerequisiteGraphController(PrerequisiteGraphService graphService, AdaptiveQuizService quizService) {
        this.graphService = graphService;
        this.quizService = quizService;
    }

    @GetMapping("/graph/nodes")
    public ResponseEntity<List<SkillNode>> getAllGraphNodes(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String domainTrack,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(graphService.getAllNodes(status, domainTrack, search));
    }

    @GetMapping("/graph/nodes/{id}")
    public ResponseEntity<SkillNode> getNodeById(@PathVariable Long id) {
        return ResponseEntity.ok(graphService.getNodeById(id));
    }

    @GetMapping("/graph/analytics")
    public ResponseEntity<Map<String, Object>> getGraphAnalytics() {
        return ResponseEntity.ok(graphService.getGraphAnalyticsAndTopology());
    }

    @PostMapping("/graph/nodes")
    public ResponseEntity<SkillNode> createSkillNode(@RequestBody SkillNode node) {
        return ResponseEntity.ok(graphService.saveNode(node));
    }

    @PutMapping("/graph/nodes/{id}/practice")
    public ResponseEntity<SkillNode> recordAdaptivePractice(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        int newMasteryScore = payload.containsKey("newMasteryScore") ? Integer.parseInt(payload.get("newMasteryScore").toString()) : 92;
        int masteryThreshold = payload.containsKey("masteryThreshold") ? Integer.parseInt(payload.get("masteryThreshold").toString()) : 80;
        String evaluatorOrEngine = payload.containsKey("evaluatorOrEngine") ? payload.get("evaluatorOrEngine").toString() : "Venkateshwari Ketineni";
        String mode = payload.containsKey("mode") ? payload.get("mode").toString() : "ADAPTIVE_DIAGNOSTIC_QUIZ";
        String remarks = payload.containsKey("remarks") ? payload.get("remarks").toString() : "Passed Adaptive Practice Prerequisite Check";
        return ResponseEntity.ok(graphService.submitAdaptivePractice(id, newMasteryScore, masteryThreshold, evaluatorOrEngine, mode, remarks));
    }

    @DeleteMapping("/graph/nodes/{id}")
    public ResponseEntity<Map<String, String>> deleteSkillNode(@PathVariable Long id) {
        graphService.deleteNode(id);
        return ResponseEntity.ok(Map.of("message", "Skill node removed from Prerequisite DAG", "id", id.toString()));
    }

    @GetMapping("/assessments/adaptive-quiz")
    public ResponseEntity<List<AdaptiveQuizQuestion>> getAdaptiveQuiz(@RequestParam String nodeCode) {
        return ResponseEntity.ok(quizService.getAdaptiveQuestions(nodeCode));
    }

    @GetMapping("/notifications/webhooks")
    public ResponseEntity<List<LmsWebhookEvent>> getWebhookLogs() {
        return ResponseEntity.ok(graphService.getWebhookLogs());
    }

    @PostMapping("/notifications/dispatch-sweep")
    public ResponseEntity<LmsWebhookEvent> dispatchZpdSweep() {
        return ResponseEntity.ok(graphService.triggerZpdRecommendationSweep());
    }

    @GetMapping("/credentials/verify/{hash}")
    public ResponseEntity<?> verifyMasteryCredential(@PathVariable String hash) {
        return graphService.verifyCredentialByHash(hash)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("verified", false, "message", "Mastery credential hash not found")));
    }
}
