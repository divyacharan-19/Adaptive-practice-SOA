package com.klh.soa.prerequisite;

import com.klh.soa.prerequisite.model.SkillNode;
import com.klh.soa.prerequisite.service.PrerequisiteGraphService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PrerequisiteGraphServiceTest {

    @Test
    void testDagPrerequisiteUnlockPropagationAndBktMastery() {
        PrerequisiteGraphService service = new PrerequisiteGraphService();
        List<SkillNode> initial = service.getAllNodes(null, null, null);
        assertEquals(8, initial.size());

        // Initially CS-202 (ID 4) is at 62% (<80% threshold) -> REMEDIATION_REQUIRED
        // Therefore CS-301 (ID 6, depends on CS-202) MUST be LOCKED_BY_PREREQ
        SkillNode cs202 = service.getNodeById(4L);
        SkillNode cs301 = service.getNodeById(6L);
        assertEquals("REMEDIATION_REQUIRED", cs202.getStatus());
        assertEquals("LOCKED_BY_PREREQ", cs301.getStatus());

        // Complete adaptive practice on CS-202 with 96% score -> CS-202 becomes MASTERED
        // And CS-301 automatically unlocks into READY_TO_PRACTICE!
        SkillNode updated202 = service.submitAdaptivePractice(
                4L, 96, 80, "Venkateshwari Ketineni", "ADAPTIVE_DIAGNOSTIC_QUIZ", "Mastered BFS/DFS & DAG Traversal"
        );
        assertEquals("MASTERED", updated202.getStatus());

        SkillNode unlocked301 = service.getNodeById(6L);
        assertEquals("READY_TO_PRACTICE", unlocked301.getStatus(), "Downstream node CS-301 should unlock automatically!");

        Map<String, Object> analytics = service.getGraphAnalyticsAndTopology();
        assertNotNull(analytics.get("adaptiveTopologicalSequence"));
    }
}
