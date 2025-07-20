package com.erp.platform.repository;

import com.erp.platform.entity.StoreDataIsolation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 店铺数据隔离仓储接口
 *
 * @author ERP System
 */
@Repository
public interface StoreDataIsolationRepository extends JpaRepository<StoreDataIsolation, Long> {
    
    /**
     * 根据店铺ID查找数据隔离配置
     */
    List<StoreDataIsolation> findByStoreId(Long storeId);
    
    /**
     * 根据店铺ID和数据类型查找配置
     */
    Optional<StoreDataIsolation> findByStoreIdAndDataType(Long storeId, StoreDataIsolation.DataType dataType);
    
    /**
     * 根据数据类型查找所有配置
     */
    List<StoreDataIsolation> findByDataType(StoreDataIsolation.DataType dataType);
    
    /**
     * 根据隔离级别查找配置
     */
    List<StoreDataIsolation> findByIsolationLevel(StoreDataIsolation.IsolationLevel isolationLevel);
    
    /**
     * 查找启用的配置
     */
    List<StoreDataIsolation> findByEnabled(Boolean enabled);
    
    /**
     * 根据店铺ID和启用状态查找配置
     */
    List<StoreDataIsolation> findByStoreIdAndEnabled(Long storeId, Boolean enabled);
}