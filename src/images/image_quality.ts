
/**
 * 
 * 判断图片质量：
 * 1. 编程实现
 * 最常见且高效的方法是基于拉普拉斯方差（Variance of the Laplacian） 算法。
 * 图像越清晰，边缘的梯度变化越大，拉普拉斯算子计算出的方差就越高。
 * 在 Node.js 中，可以使用 sharp 或 opencv4nodejs，但 sharp 不直接提供模糊度计算功能，需要手动拉普拉斯方差计算。
 * opencv4nodejs是 Node.js 对 C++ OpenCV 库的封装。OpenCV 包含了高度优化的图像处理和计算机视觉算法，包括现成的拉普拉斯方差函数。
 * 性能极高，结果准确。不过安装麻烦，需要c++编译环境。
 * 2. 云服务AI判断
 * 腾讯云的图片质量评分服务：https://cloud.tencent.com/document/product/436/116450
 * 每月评估小于100万次，3元/千次
 */