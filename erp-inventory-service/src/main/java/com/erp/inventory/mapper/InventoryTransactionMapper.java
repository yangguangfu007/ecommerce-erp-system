package com.erp.inventory.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.inventory.entity.InventoryTransaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 库存变动记录Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface InventoryTransactionMapper extends BaseMapper<InventoryTransaction> {

    /**
     * 根据事务ID查询变动记录
     *
     * @param transactionId 事务ID
     * @return 变动记录列表
     */
    @Select("SELECT * FROM inventory_transaction WHERE transaction_id = #{transactionId} ORDER BY created_at")
    List<InventoryTransaction> selectByTransactionId(@Param("transactionId") String transactionId);

    /**
     * 根据SKU和店铺ID查询变动记录
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @param limit   限制条数
     * @return 变动记录列表
     */
    @Select("SELECT * FROM inventory_transaction " +
            "WHERE sku = #{sku} AND store_id = #{storeId} " +
            "ORDER BY created_at DESC LIMIT #{limit}")
    List<InventoryTransaction> selectBySkuAndStore(@Param("sku") String sku, 
                                                  @Param("storeId") Long storeId, 
                                                  @Param("limit") Integer limit);

    /**
     * 根据关联业务ID查询变动记录
     *
     * @param referenceId 关联业务ID
     * @return 变动记录列表
     */
    @Select("SELECT * FROM inventory_transaction WHERE reference_id = #{referenceId} ORDER BY created_at")
    List<InventoryTransaction> selectByReferenceId(@Param("referenceId") String referenceId);

    /**
     * 查询指定时间范围内的变动记录
     *
     * @param sku       SKU编码
     * @param storeId   店铺ID
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 变动记录列表
     */
    @Select("SELECT * FROM inventory_transaction " +
            "WHERE sku = #{sku} AND store_id = #{storeId} " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime} " +
            "ORDER BY created_at DESC")
    List<InventoryTransaction> selectByTimeRange(@Param("sku") String sku,
                                               @Param("storeId") Long storeId,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);

    /**
     * 统计指定时间范围内的库存变动汇总
     *
     * @param sku       SKU编码
     * @param storeId   店铺ID
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 变动汇总
     */
    @Select("SELECT transaction_type, SUM(quantity) as total_quantity " +
            "FROM inventory_transaction " +
            "WHERE sku = #{sku} AND store_id = #{storeId} " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime} " +
            "GROUP BY transaction_type")
    List<InventoryTransaction> selectSummaryByTimeRange(@Param("sku") String sku,
                                                       @Param("storeId") Long storeId,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime);
}