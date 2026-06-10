package com.example.application.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.application.dto.FlaskParseResponse;
import com.example.application.dto.SaveTabRequest;
import com.example.application.dto.TabResponse;
import com.example.application.dto.WidgetDTO;
import com.example.application.model.DataSource;
import com.example.application.model.UserTab;
import com.example.application.model.Widget;
import com.example.application.repository.DataSourceRepository;
import com.example.application.repository.UserTabRepository;
import com.example.application.repository.WidgetRepository;

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
    public TabResponse importFile(MultipartFile file, Long userId, String customTitle,
                                  String separator, Integer skipRows, String mappingJson) {

        // 1. Получаем ответ от Flask - просто список транзакций
        FlaskParseResponse flaskResponse = flaskIntegrationService.parseFile(file, separator, skipRows, mappingJson);

        // 2. Создаем и сохраняем вкладку пользователя
        UserTab tab = new UserTab();
        tab.setUserId(userId);
        tab.setTitle(customTitle);
        if (tab.getWidgets() == null) {
            tab.setWidgets(new ArrayList<>());
        }
        final UserTab savedTab = userTabRepository.save(tab);

        List<Map<String, Object>> allTransactions = flaskResponse.getTransactions();

        if (allTransactions == null || allTransactions.isEmpty()) {
            System.out.println("No transactions from Flask");
            return getTabById(savedTab.getId());
        }

        System.out.println("=== DEBUG: Transactions from Flask ===");
        System.out.println("Total transactions: " + allTransactions.size());

        // 3. Группируем транзакции по типу
        List<Map<String, Object>> incomeTransactions = new ArrayList<>();
        List<Map<String, Object>> expenseTransactions = new ArrayList<>();

        for (Map<String, Object> transaction : allTransactions) {
            String type = (String) transaction.get("type");
            if ("INCOME".equalsIgnoreCase(type)) {
                incomeTransactions.add(transaction);
            } else if ("EXPENSE".equalsIgnoreCase(type)) {
                expenseTransactions.add(transaction);
            }
        }

        System.out.println("Income transactions: " + incomeTransactions.size());
        System.out.println("Expense transactions: " + expenseTransactions.size());

        // 4. Создаем DataSource и Widget для каждой группы
        int yPosition = 0;

        if (!incomeTransactions.isEmpty()) {
            DataSource incomeDS = new DataSource();
            incomeDS.setName("Income Data");
            Map<String, Object> incomePayload = new HashMap<>();
            incomePayload.put("transactions", incomeTransactions);
            incomeDS.setPayload(incomePayload);
            incomeDS = dataSourceRepository.save(incomeDS);

            Widget incomeWidget = new Widget();
            incomeWidget.setTab(savedTab);
            incomeWidget.setDataSource(incomeDS);
            incomeWidget.setType("chart");  // Тип виджета, не транзакции
            incomeWidget.setTitle("Income Data");

            Map<String, Object> gridPos = new HashMap<>();
            gridPos.put("x", 0);
            gridPos.put("y", yPosition);
            gridPos.put("w", 6);
            gridPos.put("h", 4);
            gridPos.put("cols", 12);
            gridPos.put("rows", 12);
            incomeWidget.setGridPosition(gridPos);
            incomeWidget.setSettings(new HashMap<>());

            widgetRepository.save(incomeWidget);
            savedTab.getWidgets().add(incomeWidget);
            yPosition += 4;
        }

        if (!expenseTransactions.isEmpty()) {
            DataSource expenseDS = new DataSource();
            expenseDS.setName("Expense Data");
            Map<String, Object> expensePayload = new HashMap<>();
            expensePayload.put("transactions", expenseTransactions);
            expenseDS.setPayload(expensePayload);
            expenseDS = dataSourceRepository.save(expenseDS);

            Widget expenseWidget = new Widget();
            expenseWidget.setTab(savedTab);
            expenseWidget.setDataSource(expenseDS);
            expenseWidget.setType("chart");  // Тип виджета, не транзакции
            expenseWidget.setTitle("Expense Data");

            Map<String, Object> gridPos = new HashMap<>();
            gridPos.put("x", 6);
            gridPos.put("y", 0);
            gridPos.put("w", 6);
            gridPos.put("h", 4);
            gridPos.put("cols", 12);
            gridPos.put("rows", 12);
            expenseWidget.setGridPosition(gridPos);
            expenseWidget.setSettings(new HashMap<>());

            widgetRepository.save(expenseWidget);
            savedTab.getWidgets().add(expenseWidget);
        }

        System.out.println("Created " + savedTab.getWidgets().size() + " widgets");

        return getTabById(savedTab.getId());
    }

    @Transactional(readOnly = true)
    public TabResponse getTabById(Long id) {
        UserTab tab = userTabRepository.findByIdWithWidgetsAndDataSources(id)
                .orElseThrow(() -> new RuntimeException("Tab not found: " + id));

        return convertToResponse(tab);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTabTransactions(Long tabId) {
        System.out.println("=== getTabTransactions called for tabId: " + tabId + " ===");

        UserTab tab = userTabRepository.findByIdWithWidgetsAndDataSources(tabId)
                .orElseThrow(() -> new RuntimeException("Tab not found: " + tabId));

        List<Map<String, Object>> allTransactions = new ArrayList<>();

        // Собираем транзакции из всех DataSource виджетов этой вкладки
        for (Widget widget : tab.getWidgets()) {
            if (widget.getDataSource() != null) {
                Map<String, Object> payload = widget.getDataSource().getPayload();
                if (payload != null && payload.containsKey("transactions")) {
                    Object transactionsObj = payload.get("transactions");
                    if (transactionsObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> transactions = (List<Map<String, Object>>) transactionsObj;
                        allTransactions.addAll(transactions);
                        System.out.println("Added " + transactions.size() + " transactions from widget " + widget.getId());
                    }
                }
            }
        }

        System.out.println("Total transactions collected: " + allTransactions.size());
        return allTransactions;
    }

    @Transactional(readOnly = true)
    public List<TabResponse> getTabsByUserId(Long userId) {
        List<UserTab> tabs = userTabRepository.findByUserId(userId);
        return tabs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private TabResponse convertToResponse(UserTab tab) {
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