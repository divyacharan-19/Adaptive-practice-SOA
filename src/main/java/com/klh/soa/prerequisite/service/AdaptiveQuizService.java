package com.klh.soa.prerequisite.service;

import com.klh.soa.prerequisite.model.AdaptiveQuizQuestion;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdaptiveQuizService {

    public List<AdaptiveQuizQuestion> getAdaptiveQuestions(String nodeCode) {
        String code = nodeCode == null ? "CS-202" : nodeCode.toUpperCase();
        if (code.contains("202") || code.contains("301")) {
            return List.of(
                new AdaptiveQuizQuestion(1, code,
                        "Which graph property must hold for a Prerequisite Skill Graph to have a valid topological learning order without circular deadlocks?",
                        List.of("It must be a Directed Acyclic Graph (DAG) with zero directed cycles", "It must be a complete undirected graph", "Every vertex must have out-degree 5", "It must contain negative weight cycles"), 0),
                new AdaptiveQuizQuestion(2, code,
                        "In Kahn's Topological Sort algorithm, which skill nodes are placed into the initial READY_TO_PRACTICE frontier queue?",
                        List.of("Nodes with in-degree 0 (or whose parent prerequisites are all MASTERED)", "Nodes with maximum out-degree", "Randomly selected leaf nodes", "Only locked nodes"), 0),
                new AdaptiveQuizQuestion(3, code,
                        "What is the time complexity of Breadth-First Search (BFS) traversal across a Prerequisite Graph with V nodes and E dependency edges?",
                        List.of("O(V + E)", "O(V^3)", "O(2^V)", "O(log V)"), 0)
            );
        } else {
            return List.of(
                new AdaptiveQuizQuestion(1, code,
                        "In Bayesian Knowledge Tracing (BKT), what does the posterior probability P(L_t) represent after a learner completes an adaptive practice item?",
                        List.of("The updated probability that the learner has mastered the latent skill node", "The network latency of the HTTP call", "The number of CSS stylesheets", "The database disk usage"), 0),
                new AdaptiveQuizQuestion(2, code,
                        "How does the Zone of Proximal Development (ZPD) rule filter nodes in the Adaptive Practice Prerequisite Graph?",
                        List.of("It selects unmastered nodes whose direct prerequisite nodes are 100% MASTERED", "It unlocks all advanced nodes before foundational ones", "It hides all foundational skills", "It disables practice scoring"), 0),
                new AdaptiveQuizQuestion(3, code,
                        "In a Service-Oriented Architecture (SOA), how does completing a prerequisite node automatically unlock downstream nodes?",
                        List.of("The PUT /api/graph/nodes/{id}/practice service updates the node score and recomputes DAG dependency states", "By manually editing static HTML tables", "By restarting the operating system", "By deleting parent edges"), 0)
            );
        }
    }
}
