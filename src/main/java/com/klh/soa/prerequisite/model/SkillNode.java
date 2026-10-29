package com.klh.soa.prerequisite.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class SkillNode {
    private Long id;
    private String nodeCode;          // e.g., CS-101, CS-201
    private String skillTitle;        // e.g., Graph Traversal (BFS & DFS)
    private String learnerName;       // e.g., Sahith, Divya Charan, Mohan Kumar
    private String domainTrack;       // Algorithms & Graph Theory, Distributed SOA Systems, AI & Knowledge Tracing
    private String difficultyTier;    // FOUNDATIONAL, INTERMEDIATE, ADVANCED
    private List<String> prerequisiteCodes = new ArrayList<>();
    private int masteryScore;         // 0 to 100%
    private int masteryThreshold;     // Default 80%
    private double bktProbability;    // Bayesian Knowledge Tracing P(L_t) in % (0.0 to 99.9%)
    private int practiceAttempts;
    private int estimatedMinutes;
    private LocalDate lastPracticedDate;
    private String status;            // MASTERED, READY_TO_PRACTICE, REMEDIATION_REQUIRED, LOCKED_BY_PREREQ
    private String credentialHash;    // KLH-DAG-XXXXXXXX
    private List<PracticeAttemptLog> history = new ArrayList<>();

    public SkillNode() {}

    public SkillNode(Long id, String nodeCode, String skillTitle, String learnerName,
                     String domainTrack, String difficultyTier, List<String> prerequisiteCodes,
                     int masteryScore, int masteryThreshold, int practiceAttempts,
                     int estimatedMinutes, LocalDate lastPracticedDate) {
        this.id = id;
        this.nodeCode = nodeCode;
        this.skillTitle = skillTitle;
        this.learnerName = learnerName;
        this.domainTrack = domainTrack;
        this.difficultyTier = difficultyTier;
        this.prerequisiteCodes = prerequisiteCodes != null ? new ArrayList<>(prerequisiteCodes) : new ArrayList<>();
        this.masteryScore = masteryScore;
        this.masteryThreshold = masteryThreshold;
        this.practiceAttempts = practiceAttempts;
        this.estimatedMinutes = estimatedMinutes;
        this.lastPracticedDate = lastPracticedDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNodeCode() { return nodeCode; }
    public void setNodeCode(String nodeCode) { this.nodeCode = nodeCode; }

    public String getSkillTitle() { return skillTitle; }
    public void setSkillTitle(String skillTitle) { this.skillTitle = skillTitle; }

    public String getLearnerName() { return learnerName; }
    public void setLearnerName(String learnerName) { this.learnerName = learnerName; }

    public String getDomainTrack() { return domainTrack; }
    public void setDomainTrack(String domainTrack) { this.domainTrack = domainTrack; }

    public String getDifficultyTier() { return difficultyTier; }
    public void setDifficultyTier(String difficultyTier) { this.difficultyTier = difficultyTier; }

    public List<String> getPrerequisiteCodes() { return prerequisiteCodes; }
    public void setPrerequisiteCodes(List<String> prerequisiteCodes) { this.prerequisiteCodes = prerequisiteCodes; }

    public int getMasteryScore() { return masteryScore; }
    public void setMasteryScore(int masteryScore) { this.masteryScore = masteryScore; }

    public int getMasteryThreshold() { return masteryThreshold; }
    public void setMasteryThreshold(int masteryThreshold) { this.masteryThreshold = masteryThreshold; }

    public double getBktProbability() { return bktProbability; }
    public void setBktProbability(double bktProbability) { this.bktProbability = bktProbability; }

    public int getPracticeAttempts() { return practiceAttempts; }
    public void setPracticeAttempts(int practiceAttempts) { this.practiceAttempts = practiceAttempts; }

    public int getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(int estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public LocalDate getLastPracticedDate() { return lastPracticedDate; }
    public void setLastPracticedDate(LocalDate lastPracticedDate) { this.lastPracticedDate = lastPracticedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCredentialHash() { return credentialHash; }
    public void setCredentialHash(String credentialHash) { this.credentialHash = credentialHash; }

    public List<PracticeAttemptLog> getHistory() { return history; }
    public void setHistory(List<PracticeAttemptLog> history) { this.history = history; }
}
