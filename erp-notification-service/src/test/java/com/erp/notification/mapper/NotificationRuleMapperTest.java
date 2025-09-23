package com.erp.notification.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.notification.entity.NotificationRule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 通知规则Mapper单元测试
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("通知规则Mapper测试")
class NotificationRuleMapperTest {

    @Autowired
    private NotificationRuleMapper ruleMapper;

    @Test
    @DisplayName("测试BaseMapperPlus的基本CRUD操作")
    void testBaseMapperPlusCrudOperations() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        rule.setRuleName("测试规则");
        rule.setDescription("测试规则描述");
        rule.setEventType("TEST_EVENT");
        rule.setBusinessType("TEST");
        rule.setTemplateId(1L);
        rule.setRecipients(Arrays.asList("ADMIN", "MANAGER"));
        rule.setRecipientType("ROLE");
        rule.setEnabled(true);
        rule.setPriority(1);
        rule.setExecutionLimit(10);
        rule.setExecutionCount(0);

        // 测试插入
        int insertResult = ruleMapper.insert(rule);
        assertThat(insertResult).isEqualTo(1);
        assertThat(rule.getId()).isNotNull();

        // 测试根据ID查询
        NotificationRule found = ruleMapper.selectById(rule.getId());
        assertThat(found).isNotNull();
        assertThat(found.getRuleName()).isEqualTo("测试规则");
        assertThat(found.getEventType()).isEqualTo("TEST_EVENT");
        assertThat(found.getRecipients()).contains("ADMIN", "MANAGER");
        assertThat(found.isEnabled()).isTrue();
        assertThat(found.getExecutionCount()).isEqualTo(0);

        // 测试更新
        found.setRuleName("更新后的测试规则");
        found.setExecutionCount(5);
        int updateResult = ruleMapper.updateById(found);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新结果
        NotificationRule updated = ruleMapper.selectById(rule.getId());
        assertThat(updated.getRuleName()).isEqualTo("更新后的测试规则");
        assertThat(updated.getExecutionCount()).isEqualTo(5);

        // 测试逻辑删除
        int deleteResult = ruleMapper.deleteById(rule.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除结果（应该查询不到）
        NotificationRule deleted = ruleMapper.selectById(rule.getId());
        assertThat(deleted).isNull();
    }

    @Test
    @DisplayName("测试BaseMapperPlus的增强查询方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 准备测试数据
        NotificationRule rule1 = createTestRule("规则1", "ORDER_CREATED", "ORDER", true, 1);
        NotificationRule rule2 = createTestRule("规则2", "ORDER_CREATED", "ORDER", false, 2);
        NotificationRule rule3 = createTestRule("规则3", "INVENTORY_LOW", "INVENTORY", true, 3);

        ruleMapper.insert(rule1);
        ruleMapper.insert(rule2);
        ruleMapper.insert(rule3);

        // 测试条件查询数量
        Long enabledCount = ruleMapper.selectCountByCondition(
            new LambdaQueryWrapper<NotificationRule>().eq(NotificationRule::getEnabled, true)
        );
        assertThat(enabledCount).isGreaterThanOrEqualTo(2L);

        // 测试条件存在性检查
        boolean exists = ruleMapper.existsByCondition(
            new LambdaQueryWrapper<NotificationRule>()
                .eq(NotificationRule::getEventType, "ORDER_CREATED")
                .eq(NotificationRule::getEnabled, true)
        );
        assertThat(exists).isTrue();

        // 测试条件查询列表
        List<NotificationRule> orderRules = ruleMapper.selectAllByCondition(
            new LambdaQueryWrapper<NotificationRule>()
                .eq(NotificationRule::getBusinessType, "ORDER")
                .orderByDesc(NotificationRule::getPriority)
        );
        assertThat(orderRules).hasSizeGreaterThanOrEqualTo(2);

        // 清理测试数据
        ruleMapper.deleteById(rule1.getId());
        ruleMapper.deleteById(rule2.getId());
        ruleMapper.deleteById(rule3.getId());
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 准备测试数据
        NotificationRule rule1 = createTestRule("事件规则1", "USER_LOGIN", "USER", true, 1);
        rule1.setTemplateId(100L);
        NotificationRule rule2 = createTestRule("事件规则2", "USER_LOGIN", "USER", true, 2);
        rule2.setTemplateId(101L);
        NotificationRule rule3 = createTestRule("事件规则3", "ORDER_CREATED", "ORDER", false, 3);
        rule3.setTemplateId(100L);

        ruleMapper.insert(rule1);
        ruleMapper.insert(rule2);
        ruleMapper.insert(rule3);

        // 测试根据事件类型查询启用的规则
        List<NotificationRule> loginRules = ruleMapper.selectEnabledByEventType("USER_LOGIN");
        assertThat(loginRules).hasSize(2);
        assertThat(loginRules.get(0).getPriority()).isGreaterThanOrEqualTo(loginRules.get(1).getPriority()); // 验证按优先级排序

        // 测试根据业务类型查询启用的规则
        List<NotificationRule> userRules = ruleMapper.selectEnabledByBusinessType("USER");
        assertThat(userRules).hasSize(2);

        // 测试根据模板ID查询规则
        List<NotificationRule> template100Rules = ruleMapper.selectByTemplateId(100L);
        assertThat(template100Rules).hasSize(2);

        // 测试查询启用的规则数量
        Long enabledCount = ruleMapper.countEnabledRules();
        assertThat(enabledCount).isGreaterThanOrEqualTo(2L);

        // 测试增加执行次数
        int incrementResult = ruleMapper.incrementExecutionCount(rule1.getId());
        assertThat(incrementResult).isEqualTo(1);

        // 验证执行次数增加
        NotificationRule updatedRule = ruleMapper.selectById(rule1.getId());
        assertThat(updatedRule.getExecutionCount()).isEqualTo(1);

        // 测试查询超过限制的规则（设置一个很小的限制）
        rule1.setExecutionLimit(1);
        rule1.setExecutionCount(2);
        ruleMapper.updateById(rule1);

        List<NotificationRule> overLimitRules = ruleMapper.selectOverLimitRules();
        assertThat(overLimitRules).hasSizeGreaterThanOrEqualTo(1);

        // 清理测试数据
        ruleMapper.deleteById(rule1.getId());
        ruleMapper.deleteById(rule2.getId());
        ruleMapper.deleteById(rule3.getId());
    }

    @Test
    @DisplayName("测试JSON字段查询和批量操作")
    void testJsonFieldQueryAndBatchOperations() {
        // 准备测试数据
        NotificationRule rule1 = createTestRule("JSON规则1", "TEST_EVENT", "TEST", true, 1);
        rule1.setRecipientType("ROLE");
        rule1.setRecipients(Arrays.asList("ADMIN", "MANAGER"));

        NotificationRule rule2 = createTestRule("JSON规则2", "TEST_EVENT", "TEST", true, 2);
        rule2.setRecipientType("USER");
        rule2.setRecipients(Arrays.asList("user1", "user2"));

        NotificationRule rule3 = createTestRule("JSON规则3", "TEST_EVENT", "TEST", false, 3);
        rule3.setRecipientType("ROLE");
        rule3.setRecipients(Arrays.asList("ADMIN", "OPERATOR"));

        ruleMapper.insert(rule1);
        ruleMapper.insert(rule2);
        ruleMapper.insert(rule3);

        // 测试根据接收者查询（JSON_CONTAINS查询）
        List<NotificationRule> adminRules = ruleMapper.selectByRecipient("ROLE", "ADMIN");
        assertThat(adminRules).hasSizeGreaterThanOrEqualTo(1);

        // 测试批量更新启用状态
        String ruleIds = rule1.getId() + "," + rule3.getId();
        int batchUpdateResult = ruleMapper.batchUpdateEnabled(ruleIds, true);
        assertThat(batchUpdateResult).isEqualTo(2);

        // 验证批量更新结果
        NotificationRule updatedRule3 = ruleMapper.selectById(rule3.getId());
        assertThat(updatedRule3.isEnabled()).isTrue();

        // 清理测试数据
        ruleMapper.deleteById(rule1.getId());
        ruleMapper.deleteById(rule2.getId());
        ruleMapper.deleteById(rule3.getId());
    }

    /**
     * 创建测试规则
     */
    private NotificationRule createTestRule(String name, String eventType, String businessType, boolean enabled, int priority) {
        NotificationRule rule = new NotificationRule();
        rule.setRuleName(name);
        rule.setDescription("测试规则描述");
        rule.setEventType(eventType);
        rule.setBusinessType(businessType);
        rule.setTemplateId(1L);
        rule.setRecipients(Arrays.asList("ADMIN"));
        rule.setRecipientType("ROLE");
        rule.setEnabled(enabled);
        rule.setPriority(priority);
        rule.setExecutionLimit(0);
        rule.setExecutionCount(0);
        return rule;
    }
}