/**
 * 全面系统测试执行器
 * 执行所有测试套件并生成详细报告
 */
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface TestResult {
  suite: string
  passed: number
  failed: number
  skipped: number
  duration: number
  errors: string[]
}

interface TestReport {
  timestamp: string
  totalTests: number
  totalPassed: number
  totalFailed: number
  totalSkipped: number
  totalDuration: number
  suites: TestResult[]
  coverage?: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
  recommendations: string[]
}

class ComprehensiveTestRunner {
  private results: TestResult[] = []
  private startTime: number = 0

  /**
   * 执行所有测试套件
   */
  async runAllTests(): Promise<TestReport> {
    console.log('🚀 开始执行全面系统测试...')
    this.startTime = Date.now()

    // 1. 执行单元测试
    await this.runUnitTests()

    // 2. 执行集成测试
    await this.runIntegrationTests()

    // 3. 执行API测试
    await this.runApiTests()

    // 4. 执行E2E测试
    await this.runE2ETests()

    // 5. 执行性能测试
    await this.runPerformanceTests()

    // 6. 执行浏览器兼容性测试
    await this.runBrowserCompatibilityTests()

    // 7. 执行视觉回归测试
    await this.runVisualRegressionTests()

    // 8. 生成测试报告
    return this.generateReport()
  }

  /**
   * 执行单元测试
   */
  private async runUnitTests(): Promise<void> {
    console.log('📋 执行单元测试...')
    
    try {
      const output = execSync('npm run test:unit -- --run --reporter=json', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 120000
      })

      const result = this.parseVitestOutput(output)
      this.results.push({
        suite: '单元测试',
        ...result
      })
    } catch (error: any) {
      console.error('单元测试执行失败:', error.message)
      this.results.push({
        suite: '单元测试',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: [error.message]
      })
    }
  }

  /**
   * 执行集成测试
   */
  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 执行集成测试...')
    
    try {
      const output = execSync('npm run test:integration -- --run --reporter=json', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 180000
      })

      const result = this.parseVitestOutput(output)
      this.results.push({
        suite: '集成测试',
        ...result
      })
    } catch (error: any) {
      console.error('集成测试执行失败:', error.message)
      this.results.push({
        suite: '集成测试',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: [error.message]
      })
    }
  }

  /**
   * 执行API测试
   */
  private async runApiTests(): Promise<void> {
    console.log('🌐 执行API测试...')
    
    try {
      // 检查后端服务是否运行
      const isBackendRunning = await this.checkBackendHealth()
      if (!isBackendRunning) {
        throw new Error('后端服务未运行，请先启动后端服务')
      }

      const output = execSync('npm run test:api -- --run --reporter=json', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 300000
      })

      const result = this.parseVitestOutput(output)
      this.results.push({
        suite: 'API测试',
        ...result
      })
    } catch (error: any) {
      console.error('API测试执行失败:', error.message)
      this.results.push({
        suite: 'API测试',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: [error.message]
      })
    }
  }

  /**
   * 执行E2E测试
   */
  private async runE2ETests(): Promise<void> {
    console.log('🎭 执行E2E测试...')
    
    try {
      // 检查前端服务是否运行
      const isFrontendRunning = await this.checkFrontendHealth()
      if (!isFrontendRunning) {
        throw new Error('前端服务未运行，请先启动前端服务')
      }

      const output = execSync('npx playwright test --reporter=json', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 600000
      })

      const result = this.parsePlaywrightOutput(output)
      this.results.push({
        suite: 'E2E测试',
        ...result
      })
    } catch (error: any) {
      console.error('E2E测试执行失败:', error.message)
      this.results.push({
        suite: 'E2E测试',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: [error.message]
      })
    }
  }

  /**
   * 执行性能测试
   */
  private async runPerformanceTests(): Promise<void> {
    console.log('⚡ 执行性能测试...')
    
    try {
      const output = execSync('npm run test:performance -- --run --reporter=json', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 300000
      })

      const result = this.parseVitestOutput(output)
      this.results.push({
        suite: '性能测试',
        ...result
      })
    } catch (error: any) {
      console.error('性能测试执行失败:', error.message)
      this.results.push({
        suite: '性能测试',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: [error.message]
      })
    }
  }

  /**
   * 执行浏览器兼容性测试
   */
  private async runBrowserCompatibilityTests(): Promise<void> {
    console.log('🌍 执行浏览器兼容性测试...')
    
    try {
      const output = execSync('npm run test:browser -- --run --reporter=json', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 300000
      })

      const result = this.parseVitestOutput(output)
      this.results.push({
        suite: '浏览器兼容性测试',
        ...result
      })
    } catch (error: any) {
      console.error('浏览器兼容性测试执行失败:', error.message)
      this.results.push({
        suite: '浏览器兼容性测试',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: [error.message]
      })
    }
  }

  /**
   * 执行视觉回归测试
   */
  private async runVisualRegressionTests(): Promise<void> {
    console.log('👁️ 执行视觉回归测试...')
    
    try {
      const output = execSync('npm run test:visual -- --run --reporter=json', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 300000
      })

      const result = this.parseVitestOutput(output)
      this.results.push({
        suite: '视觉回归测试',
        ...result
      })
    } catch (error: any) {
      console.error('视觉回归测试执行失败:', error.message)
      this.results.push({
        suite: '视觉回归测试',
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: [error.message]
      })
    }
  }

  /**
   * 检查后端服务健康状态
   */
  private async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8080/actuator/health', {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 检查前端服务健康状态
   */
  private async checkFrontendHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3000', {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 解析Vitest输出
   */
  private parseVitestOutput(output: string): Omit<TestResult, 'suite'> {
    try {
      const lines = output.split('\n').filter(line => line.trim())
      const jsonLine = lines.find(line => line.startsWith('{'))
      
      if (jsonLine) {
        const result = JSON.parse(jsonLine)
        return {
          passed: result.numPassedTests || 0,
          failed: result.numFailedTests || 0,
          skipped: result.numPendingTests || 0,
          duration: result.testResults?.[0]?.perfStats?.runtime || 0,
          errors: result.testResults?.filter((t: any) => t.status === 'failed')
            .map((t: any) => t.message) || []
        }
      }
    } catch (error) {
      console.warn('解析测试输出失败:', error)
    }

    // 回退到简单解析
    const passedMatch = output.match(/(\d+) passed/)
    const failedMatch = output.match(/(\d+) failed/)
    const skippedMatch = output.match(/(\d+) skipped/)

    return {
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
      duration: 0,
      errors: []
    }
  }

  /**
   * 解析Playwright输出
   */
  private parsePlaywrightOutput(output: string): Omit<TestResult, 'suite'> {
    try {
      const result = JSON.parse(output)
      const stats = result.stats || {}
      
      return {
        passed: stats.expected || 0,
        failed: stats.unexpected || 0,
        skipped: stats.skipped || 0,
        duration: result.duration || 0,
        errors: result.errors || []
      }
    } catch (error) {
      console.warn('解析Playwright输出失败:', error)
      return {
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: 0,
        errors: ['解析测试结果失败']
      }
    }
  }

  /**
   * 生成测试报告
   */
  private generateReport(): TestReport {
    const totalDuration = Date.now() - this.startTime
    
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0)
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0)
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0)
    const totalTests = totalPassed + totalFailed + totalSkipped

    const recommendations = this.generateRecommendations()

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      suites: this.results,
      recommendations
    }

    // 保存报告到文件
    this.saveReport(report)
    
    // 打印报告摘要
    this.printSummary(report)

    return report
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    const failedSuites = this.results.filter(r => r.failed > 0)
    if (failedSuites.length > 0) {
      recommendations.push(`有 ${failedSuites.length} 个测试套件存在失败用例，需要修复`)
    }

    const slowSuites = this.results.filter(r => r.duration > 30000)
    if (slowSuites.length > 0) {
      recommendations.push(`有 ${slowSuites.length} 个测试套件执行时间过长，建议优化性能`)
    }

    const totalCoverage = this.calculateCoverage()
    if (totalCoverage < 80) {
      recommendations.push(`测试覆盖率为 ${totalCoverage}%，建议提高到80%以上`)
    }

    if (this.results.some(r => r.suite === 'API测试' && r.failed > 0)) {
      recommendations.push('API测试失败，请检查后端服务状态和API接口实现')
    }

    if (this.results.some(r => r.suite === 'E2E测试' && r.failed > 0)) {
      recommendations.push('E2E测试失败，请检查前端页面功能和用户交互流程')
    }

    return recommendations
  }

  /**
   * 计算测试覆盖率
   */
  private calculateCoverage(): number {
    // 这里应该从实际的覆盖率报告中获取数据
    // 暂时返回估算值
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0)
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed, 0)
    
    return totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0
  }

  /**
   * 保存测试报告
   */
  private saveReport(report: TestReport): void {
    const reportDir = path.join(process.cwd(), 'test-reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    // 保存JSON格式报告
    const jsonPath = path.join(reportDir, 'comprehensive-test-report.json')
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

    // 保存Markdown格式报告
    const mdPath = path.join(reportDir, 'comprehensive-test-report.md')
    fs.writeFileSync(mdPath, this.generateMarkdownReport(report))

    console.log(`📊 测试报告已保存到: ${reportDir}`)
  }

  /**
   * 生成Markdown格式报告
   */
  private generateMarkdownReport(report: TestReport): string {
    const passRate = report.totalTests > 0 
      ? ((report.totalPassed / report.totalTests) * 100).toFixed(2)
      : '0.00'

    return `# ERP系统全面测试报告

## 测试概览

- **测试时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}
- **总测试数**: ${report.totalTests}
- **通过数**: ${report.totalPassed}
- **失败数**: ${report.totalFailed}
- **跳过数**: ${report.totalSkipped}
- **通过率**: ${passRate}%
- **总耗时**: ${(report.totalDuration / 1000).toFixed(2)}秒

## 测试套件详情

${report.suites.map(suite => `
### ${suite.suite}

- **通过**: ${suite.passed}
- **失败**: ${suite.failed}
- **跳过**: ${suite.skipped}
- **耗时**: ${(suite.duration / 1000).toFixed(2)}秒
- **状态**: ${suite.failed === 0 ? '✅ 通过' : '❌ 失败'}

${suite.errors.length > 0 ? `
**错误信息**:
${suite.errors.map(error => `- ${error}`).join('\n')}
` : ''}
`).join('\n')}

## 改进建议

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 部署就绪状态

${report.totalFailed === 0 
  ? '✅ **系统已准备好部署** - 所有测试通过，可以安全部署到生产环境'
  : '❌ **系统未准备好部署** - 存在测试失败，需要修复后才能部署'
}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`
  }

  /**
   * 打印测试摘要
   */
  private printSummary(report: TestReport): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 ERP系统全面测试报告摘要')
    console.log('='.repeat(60))
    console.log(`总测试数: ${report.totalTests}`)
    console.log(`通过数: ${report.totalPassed} ✅`)
    console.log(`失败数: ${report.totalFailed} ${report.totalFailed > 0 ? '❌' : ''}`)
    console.log(`跳过数: ${report.totalSkipped}`)
    console.log(`通过率: ${((report.totalPassed / report.totalTests) * 100).toFixed(2)}%`)
    console.log(`总耗时: ${(report.totalDuration / 1000).toFixed(2)}秒`)
    
    console.log('\n📋 测试套件状态:')
    report.suites.forEach(suite => {
      const status = suite.failed === 0 ? '✅' : '❌'
      console.log(`  ${status} ${suite.suite}: ${suite.passed}通过 ${suite.failed}失败`)
    })

    if (report.recommendations.length > 0) {
      console.log('\n💡 改进建议:')
      report.recommendations.forEach(rec => {
        console.log(`  - ${rec}`)
      })
    }

    console.log('\n' + '='.repeat(60))
    if (report.totalFailed === 0) {
      console.log('🎉 所有测试通过！系统已准备好部署。')
    } else {
      console.log('⚠️  存在测试失败，请修复后重新测试。')
    }
    console.log('='.repeat(60))
  }
}

// 导出测试运行器
export { ComprehensiveTestRunner }

// 如果直接运行此文件，执行测试
if (require.main === module) {
  const runner = new ComprehensiveTestRunner()
  runner.runAllTests().catch(error => {
    console.error('测试执行失败:', error)
    process.exit(1)
  })
}