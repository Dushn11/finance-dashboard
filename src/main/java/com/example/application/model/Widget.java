package com.example.application.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "widgets")
public class Widget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tab_id", nullable = false)
    private UserTab tab;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_source_id")
    private DataSource dataSource;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 150)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "grid_position", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> gridPosition;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb default '{}'")
    private Map<String, Object> settings = new HashMap<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserTab getTab() {
        return tab;
    }

    public void setTab(UserTab tab) {
        this.tab = tab;
    }

    public DataSource getDataSource() {
        return dataSource;
    }

    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
