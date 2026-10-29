package com.klh.soa.prerequisite.model;

import java.util.List;

public class AdaptiveQuizQuestion {
    private int questionId;
    private String nodeCode;
    private String question;
    private List<String> options;
    private int correctOptionIndex;

    public AdaptiveQuizQuestion() {}

    public AdaptiveQuizQuestion(int questionId, String nodeCode, String question, List<String> options, int correctOptionIndex) {
        this.questionId = questionId;
        this.nodeCode = nodeCode;
        this.question = question;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
    }

    public int getQuestionId() { return questionId; }
    public void setQuestionId(int questionId) { this.questionId = questionId; }

    public String getNodeCode() { return nodeCode; }
    public void setNodeCode(String nodeCode) { this.nodeCode = nodeCode; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public int getCorrectOptionIndex() { return correctOptionIndex; }
    public void setCorrectOptionIndex(int correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }
}
