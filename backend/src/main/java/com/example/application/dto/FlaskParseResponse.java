package com.example.application.dto;

import java.util.List;
import java.util.Map;

public class FlaskParseResponse {
    private String title;
    private List<FlaskWidgetData> widgets;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<FlaskWidgetData> getWidgets() {
        return widgets;
    }

    public void setWidgets(List<FlaskWidgetData> widgets) {
        this.widgets = widgets;
    }

    public static class FlaskWidgetData {
        private String type;
        private String title;
        private Map<String, Object> gridPosition;
        private Map<String, Object> settings;
        private Map<String, Object> payload;

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

        public Map<String, Object> getPayload() {
            return payload;
        }

        public void setPayload(Map<String, Object> payload) {
            this.payload = payload;
        }
    }
}
