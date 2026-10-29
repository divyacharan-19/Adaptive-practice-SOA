package com.klh.soa.prerequisite.model;

import java.time.LocalDate;

public class PracticeAttemptLog {
    private LocalDate attemptDate;
    private int previousMastery;
    private int newMastery;
    private double bktProbability;
    private String mode; // ADAPTIVE_DIAGNOSTIC_QUIZ, EVALUATOR_PRACTICE_LAB, INITIAL_DIAGNOSTIC
    private String evaluatorOrEngine;
    private String remarks;

    public PracticeAttemptLog() {}

    public PracticeAttemptLog(LocalDate attemptDate, int previousMastery, int newMastery,
                              double bktProbability, String mode, String evaluatorOrEngine, String remarks) {
        this.attemptDate = attemptDate;
        this.previousMastery = previousMastery;
        this.newMastery = newMastery;
        this.bktProbability = bktProbability;
        this.mode = mode;
        this.evaluatorOrEngine = evaluatorOrEngine;
        this.remarks = remarks;
    }

    public LocalDate getAttemptDate() { return attemptDate; }
    public void setAttemptDate(LocalDate attemptDate) { this.attemptDate = attemptDate; }

    public int getPreviousMastery() { return previousMastery; }
    public void setPreviousMastery(int previousMastery) { this.previousMastery = previousMastery; }

    public int getNewMastery() { return newMastery; }
    public void setNewMastery(int newMastery) { this.newMastery = newMastery; }

    public double getBktProbability() { return bktProbability; }
    public void setBktProbability(double bktProbability) { this.bktProbability = bktProbability; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getEvaluatorOrEngine() { return evaluatorOrEngine; }
    public void setEvaluatorOrEngine(String evaluatorOrEngine) { this.evaluatorOrEngine = evaluatorOrEngine; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
