export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // 移除 BOM 标记
        const cleanText = text.replace(/^\uFEFF/, '');
        
        // 按行分割，过滤空行
        const lines = cleanText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          reject(new Error('CSV文件格式不正确'));
          return;
        }

        // 解析标题行，移除引号和回车符
        const headers = lines[0]
          .split(',')
          .map(header => header.trim().replace(/^["']|["'\r]+$/g, ''));
        
        console.log('解析到的CSV表头:', headers);

        // 解析数据行
        const result = lines.slice(1).map(line => {
          // 使用正则表达式匹配CSV字段，处理包含逗号的字段
          const values = [];
          let matches = line.match(/(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g) || [];
          
          matches.forEach(match => {
            // 移除开头的逗号（如果有）
            let value = match.replace(/^,/, '');
            // 移除引号（如果有）
            value = value.replace(/^"|"$/g, '');
            // 替换双引号
            value = value.replace(/""/g, '"');
            // 移除回车符
            value = value.replace(/\r$/, '');
            values.push(value.trim());
          });

          // 创建数据对象
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          return row;
        });

        console.log('解析后的第一行数据:', result[0]);
        resolve(result);
      } catch (error) {
        console.error('CSV解析错误:', error);
        reject(new Error('解析CSV文件失败: ' + error.message));
      }
    };
    reader.onerror = () => {
      console.error('文件读取错误');
      reject(new Error('读取文件失败'));
    };
    reader.readAsText(file);
  });
} 