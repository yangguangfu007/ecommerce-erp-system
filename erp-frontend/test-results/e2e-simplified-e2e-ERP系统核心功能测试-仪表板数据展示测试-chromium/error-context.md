# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - img "ERP系统" [ref=e8]
      - heading "电商ERP管理系统" [level=1] [ref=e9]
      - paragraph [ref=e10]: 请登录您的账户
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: 用户名
        - textbox "用户名" [ref=e15]: admin
      - generic [ref=e16]:
        - generic [ref=e17]: 密码
        - generic [ref=e18]:
          - textbox "密码" [ref=e19]
          - button
      - generic [ref=e20]:
        - generic [ref=e21] [cursor=pointer]:
          - checkbox "记住我" [ref=e22] [cursor=pointer]
          - generic [ref=e23] [cursor=pointer]: 记住我
        - link "忘记密码？" [ref=e24] [cursor=pointer]:
          - /url: "#"
      - button "登录" [ref=e25] [cursor=pointer]:
        - generic [ref=e26] [cursor=pointer]: 登录
    - paragraph [ref=e28]: © 2025 电商ERP管理系统. 保留所有权利.
  - alert [ref=e29]:
    - img [ref=e31]
    - paragraph [ref=e33]: 请先登录
  - alert [ref=e34]:
    - img [ref=e36]
    - paragraph [ref=e38]: 检测到异常登录行为，请稍后再试
  - generic [ref=e40]:
    - generic [ref=e41]: Request failed with status code 400
    - button [ref=e42]
```