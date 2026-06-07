package com.example.application.dto;

import java.util.Map;

public class WidgetDTO {
    private Long id;
    private String type;
    private String title;
    private Map<String, Object> gridPosition;
    private Map<String, Object> settings;
    private Long dataSourceId;
    private Map<String, Object> rawData;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Map<String, Object> getGridPosition() {
        return gridPosition;
    }

    public void setGridPosition(Map<String, Object> gridPosition) {
        this.gridPosition = gridPosition;
    }

    public Map<String, Object> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, Object> settings) {
        this.settings = settings;
    }

    public Long getDataSourceId() {
        return dataSourceId;
    }

    public void setDataSourceId(Long dataSourceId) {
        this.dataSourceId = dataSourceId;
    }

    public Map<String, Object> getRawData() {
        return rawData;
    }

    public void setRawData(Map<String, Object> rawData) {
        this.rawData = rawData;
    }
}
