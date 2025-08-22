/// <reference types="vite/client" />

// 扩展 jsPDF 类型以支持 autoTable 插件
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}
