package com.example.application.service;

import com.example.application.dto.*;
import com.example.application.model.DataSource;
import com.example.application.model.UserTab;
import com.example.application.model.Widget;
import com.example.application.repository.DataSourceRepository;
import com.example.application.repository.UserTabRepository;
import com.example.application.repository.WidgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TabService {

    private final UserTabRepository userTabRepository;
    private final WidgetRepository widgetRepository;
    private final DataSourceRepository dataSourceRepository;
    private final FlaskIntegrationService flaskIntegrationService;

    public TabService(UserTabRepository userTabRepository,
                      WidgetRepository widgetRepository,
                      DataSourceRepository dataSourceRepository,
                      FlaskIntegrationService flaskIntegrationService) {
        this.userTabRepository = userTabRepository;
        this.widgetRepository = widgetRepository;
        this.dataSourceRepository = dataSourceRepository;
        this.flaskIntegrationService = flaskIntegrationService;
    }

    @Transactional
    public TabResponse saveTab(SaveTabRequest request) {
        UserTab tab = userTabRepository.findById(request.getTabId())
                .orElseThrow(() -> new RuntimeException("Tab not found: " + request.getTabId()));

        tab.setTitle(request.getTitle());

        Map<Long, Widget> existingWidgets = tab.getWidgets().stream()
                .collect(Collectors.toMap(Widget::getId, w -> w));

        Set<Long> requestWidgetIds = request.getWidgets().stream()
                .map(WidgetDTO::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        existingWidgets.keySet().stream()
                .filter(id -> !requestWidgetIds.contains(id))
                .forEach(id -> {
                    Widget toRemove = existingWidgets.get(id);
                    tab.getWidgets().remove(toRemove);
                });

        for (WidgetDTO dto : request.getWidgets()) {
            Widget widget = existingWidgets.get(dto.getId());
            if (widget != null) {
                widget.setType(dto.getType());
                widget.setTitle(dto.getTitle());
                widget.setGridPosition(dto.getGridPosition());
                widget.setSettings(dto.getSettings());
                if (dto.getDataSourceId() != null) {
                    DataSource ds = dataSourceRepository.findById(dto.getDataSourceId())
                            .orElse(null);
                    widget.setDataSource(ds);
                }
            }
        }

        userTabRepository.save(tab);

        return getTabById(tab.getId());
    }

    @Transactional
    public TabResponse importFile(MultipartFile file, Long userId) {
        FlaskParseResponse flaskResponse = flaskIntegrationService.parseFile(file);

        UserTab tab = new UserTab();
        tab.setUserId(userId);
        tab.setTitle(flaskResponse.getTitle());
        tab = userTabRepository.save(tab);

        for (FlaskParseResponse.FlaskWidgetData widgetData : flaskResponse.getWidgets()) {
            DataSource dataSource = new DataSource();
            dataSource.setName(widgetData.getTitle());
            dataSource.setPayload(widgetData.getPayload());
            dataSource = dataSourceRepository.save(dataSource);

            Widget widget = new Widget();
            widget.setTab(tab);
            widget.setDataSource(dataSource);
            widget.setType(widgetData.getType());
            widget.setTitle(widgetData.getTitle());
            widget.setGridPosition(widgetData.getGridPosition());
            widget.setSettings(widgetData.getSettings() != null ? widgetData.getSettings() : new HashMap<>());

            tab.getWidgets().add(widget);
        }

        userTabRepository.save(tab);

        return getTabById(tab.getId());
    }

    @Transactional(readOnly = true)
    public TabResponse getTabById(Long id) {
        UserTab tab = userTabRepository.findByIdWithWidgetsAndDataSources(id)
                .orElseThrow(() -> new RuntimeException("Tab not found: " + id));

        TabResponse response = new TabResponse();
        response.setTabId(tab.getId());
        response.setTitle(tab.getTitle());

        List<WidgetDTO> widgetDTOs = tab.getWidgets().stream()
                .map(widget -> {
                    WidgetDTO dto = new WidgetDTO();
                    dto.setId(widget.getId());
                    dto.setType(widget.getType());
                    dto.setTitle(widget.getTitle());
                    dto.setGridPosition(widget.getGridPosition());
                    dto.setSettings(widget.getSettings());

                    if (widget.getDataSource() != null) {
                        dto.setDataSourceId(widget.getDataSource().getId());
                        dto.setRawData(widget.getDataSource().getPayload());
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        response.setWidgets(widgetDTOs);
        return response;
    }
}
