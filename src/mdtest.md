# 帮助文档

没有帮助。测试一下渲染能力

## 标题：二级

### 三级

#### 四级

##### 五级

###### 六级

**粗体**

*斜体*

<u>下划线</u>

~~删除线~~

`代码`

行内$\LaTeX$公式

==高亮==

[超链接](http://www.baidu.com)

<!--看到此注释块说明渲染出错-->

## 块

| i | j  | k |
|---|----|---|
| 1 | 2  | 3 |
| 4 | 表格 | 6 |
| 7 | 8  | 9 |

```python
from typing import Iterator

# This is an example
class Math:
    @staticmethod
    def fib(n: int) -> Iterator[int]:
        """Fibonacci series up to n."""
        a, b = 0, 1
        while a < n:
            yield a
            a, b = b, a + b

result = sum(Math.fib(42))
print(f"The answer is {result}")
```

> 引用文本

1. 项目1
    1. 项目1.1

2. 项目2
    1. 项目2.1
    2. 项目2.2

- 无序1
    - 无序1.1
- 无序2
    - 无序2.1
    - 无序2.2

水平分割线vvv

------

水平分割线^^^
$$
\LaTeX \\ \int_{x_0^2}^{x^1_3}\sum_{i=0}^{x}\frac{1}{x^3+2}\mathtt{d}x, x\in\mathbb{R}
$$

## 图片

![miel_02](../assets/mdtest/miel_02.png)