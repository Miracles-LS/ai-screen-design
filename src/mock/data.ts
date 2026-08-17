import Mock from 'mockjs'

Mock.setup({
  // 设置请求延迟
  timeout: 2000,
})

// /api/data?date=2022-01-10  这里get请求参数是拼在url后面，所以mock的url地址要用正则表达式进行匹配，如果写成 '/api/data' 则是完整匹配 '/api/data' 这条url，会导致报错，找不到该url
Mock.mock(/\/api\/data/, 'get', options => {
  // options 可以拿到传参
  // http://www.baidu.com/api/data?date=2022-01-10
  // 创建 url
  const url = new URL(options.url, location.origin)
  // 创建 url 参数对象
  const search = new URLSearchParams(url.search)
  // 假设url上传递了 date 参数，通过 get() 方法拿到啊 date参数的传值
  const date = search.get('date')
  const data = Mock.mock({
    // |8 ：生成8个数据
    'list|8': [
      {
        // |1 ：按照后面数组里的值自动轮询出8个月份的数据
        'label|+1': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月'],
        //  |100-1000：自动生成随机数，随机数的值范围在100-1000内
        'value|100-1000': 0,
        date,
      },
    ],
  })
  return data.list
})
