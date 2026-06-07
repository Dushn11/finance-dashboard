package com.example.application.dto;

import java.util.List;

public class SaveTabRequest {
    private Long tabId;
    private String title;
    private List<WidgetDTO> widgets;

    public Long getTabId() {
        return tabId;
    }

    public void setTabId(Long tabId) {
        this.tabId = tabId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<WidgetDTO> getWidgets() {
        return widgets;
    }

    public void setWidgets(List<WidgetDTO> widgets) {
        this.widgets = widgets;
    }
}
