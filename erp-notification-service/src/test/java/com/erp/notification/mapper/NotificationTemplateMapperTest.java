package com.erp.notification.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.notification.entity.NotificationTemplate;
import com.erp.notification.enums.NotificationType;
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
 * 通知模板Mapper单元测试
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("通知模板Mapper测试")
class NotificationTemplateMapperTest {

    @Autowired
    private NotificationTemplateMapper templateMapper;

    @Test
    @DisplayName("测试BaseMapperPlus的基本CRUD操作")
    void testBaseMapperPlusCrudOperations() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateCode("TEST_TEMPLATE");
        template.setTemplateName("测试模板");
        template.setNotificationType(NotificationType.SYSTEM);
        template.setTitle("测试标题");
        template.setContent("测试内容：${userName}");
        template.setVariables(Arrays.asList("userName"));
        template.setEnabled(true);
        template.setDescription("测试模板描述");
        template.setCategory("测试分类");
        template.setSortOrder(1);

        // 测试插入
        int insertResult = templateMapper.insert(template);
        assertThat(insertResult).isEqualTo(1);
        assertThat(template.getId()).isNotNull();

        // 测试根据ID查询
        NotificationTemplate found = templateMapper.selectById(template.getId());
        assertThat(found).isNotNull();
        assertThat(found.getTemplateCode()).isEqualTo("TEST_TEMPLATE");
        assertThat(found.getTemplateName()).isEqualTo("测试模板");
        assertThat(found.getNotificationType()).isEqualTo(NotificationType.SYSTEM);
        assertThat(found.getVariables()).contains("userName");
        assertThat(found.isEnabled()).isTrue();

        // 测试更新
        found.setTemplateName("更新后的测试模板");
        found.setEnabled(false);
        int updateResult = templateMapper.updateById(found);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新结果
        NotificationTemplate updated = templateMapper.selectById(template.getId());
        assertThat(updated.getTemplateName()).isEqualTo("更新后的测试模板");
        assertThat(updated.isEnabled()).isFalse();

        // 测试逻辑删除
        int deleteResult = templateMapper.deleteById(template.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除结果（应该查询不到）
        NotificationTemplate deleted = templateMapper.selectById(template.getId());
        assertThat(deleted).isNull();
    }

    @Test
    @DisplayName("测试BaseMapperPlus的增强查询方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 准备测试数据
        NotificationTemplate template1 = createTestTemplate("TEMPLATE1", "模板1", NotificationType.SYSTEM, true);
        NotificationTemplate template2 = createTestTemplate("TEMPLATE2", "模板2", NotificationType.EMAIL, true);
        NotificationTemplate template3 = createTestTemplate("TEMPLATE3", "模板3", NotificationType.SYSTEM, false);

        templateMapper.insert(template1);
        templateMapper.insert(template2);
        templateMapper.insert(template3);

        // 测试条件查询数量
        Long enabledCount = templateMapper.selectCountByCondition(
            new LambdaQueryWrapper<NotificationTemplate>().eq(NotificationTemplate::getEnabled, true)
        );
        assertThat(enabledCount).isGreaterThanOrEqualTo(2L);

        // 测试条件存在性检查
        boolean exists = templateMapper.existsByCondition(
            new LambdaQueryWrapper<NotificationTemplate>()
                .eq(NotificationTemplate::getTemplateCode, "TEMPLATE1")
                .eq(NotificationTemplate::getEnabled, true)
        );
        assertThat(exists).isTrue();

        // 测试条件查询列表
        List<NotificationTemplate> systemTemplates = templateMapper.selectAllByCondition(
            new LambdaQueryWrapper<NotificationTemplate>()
                .eq(NotificationTemplate::getNotificationType, NotificationType.SYSTEM)
                .orderByAsc(NotificationTemplate::getSortOrder)
        );
        assertThat(systemTemplates).hasSizeGreaterThanOrEqualTo(2);

        // 清理测试数据
        templateMapper.deleteById(template1.getId());
        templateMapper.deleteById(template2.getId());
        templateMapper.deleteById(template3.getId());
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 准备测试数据
        NotificationTemplate template1 = createTestTemplate("CUSTOM_TEMPLATE1", "自定义模板1", NotificationType.SYSTEM, true);
        template1.setCategory("订单通知");
        NotificationTemplate template2 = createTestTemplate("CUSTOM_TEMPLATE2", "自定义模板2", NotificationType.EMAIL, true);
        template2.setCategory("库存通知");
        NotificationTemplate template3 = createTestTemplate("CUSTOM_TEMPLATE3", "自定义模板3", NotificationType.SYSTEM, false);
        template3.setCategory("订单通知");

        templateMapper.insert(template1);
        templateMapper.insert(template2);
        templateMapper.insert(template3);

        // 测试根据模板编码查询
        NotificationTemplate foundByCode = templateMapper.selectByTemplateCode("CUSTOM_TEMPLATE1");
        assertThat(foundByCode).isNotNull();
        assertThat(foundByCode.getTemplateName()).isEqualTo("自定义模板1");

        // 测试根据通知类型查询
        List<NotificationTemplate> systemTemplates = templateMapper.selectByNotificationType(NotificationType.SYSTEM.getCode());
        assertThat(systemTemplates).hasSizeGreaterThanOrEqualTo(2);

        // 测试查询启用的模板
        List<NotificationTemplate> enabledTemplates = templateMapper.selectEnabledTemplates();
        assertThat(enabledTemplates).hasSizeGreaterThanOrEqualTo(2);

        // 测试根据分类查询
        List<NotificationTemplate> orderTemplates = templateMapper.selectByCategory("订单通知");
        assertThat(orderTemplates).hasSizeGreaterThanOrEqualTo(2);

        // 测试统计启用的模板数量
        Long enabledCount = templateMapper.countEnabledTemplates();
        assertThat(enabledCount).isGreaterThanOrEqualTo(2L);

        // 测试检查模板编码是否存在（排除指定ID）
        boolean exists = templateMapper.existsByTemplateCodeExcludeId("CUSTOM_TEMPLATE1", template2.getId());
        assertThat(exists).isTrue();

        boolean notExists = templateMapper.existsByTemplateCodeExcludeId("CUSTOM_TEMPLATE1", template1.getId());
        assertThat(notExists).isFalse();

        // 测试查询所有分类
        List<String> categories = templateMapper.selectAllCategories();
        assertThat(categories).contains("订单通知", "库存通知");

        // 清理测试数据
        templateMapper.deleteById(template1.getId());
        templateMapper.deleteById(template2.getId());
        templateMapper.deleteById(template3.getId());
    }

    /**
     * 创建测试模板
     */
    private NotificationTemplate createTestTemplate(String code, String name, NotificationType type, boolean enabled) {
        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateCode(code);
        template.setTemplateName(name);
        template.setNotificationType(type);
        template.setTitle("测试标题");
        template.setContent("测试内容");
        template.setEnabled(enabled);
        template.setDescription("测试描述");
        template.setSortOrder(1);
        return template;
    }
}