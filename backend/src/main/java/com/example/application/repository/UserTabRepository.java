package com.example.application.repository;

import com.example.application.model.UserTab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTabRepository extends JpaRepository<UserTab, Long> {

    @Query("SELECT t FROM UserTab t LEFT JOIN FETCH t.widgets w LEFT JOIN FETCH w.dataSource WHERE t.id = :id")
    Optional<UserTab> findByIdWithWidgetsAndDataSources(@Param("id") Long id);

    List<UserTab> findByUserId(Long userId);
}
