# React Webpack Project

## 📌 Giới thiệu
Đây là một dự án React sử dụng Webpack để đóng gói và tối ưu hóa code.

## 🛠 Công nghệ sử dụng
- [React](w)
- [Webpack](w)
- [Babel](w)
- [ESLint](w) & [Prettier](w)

## 🚀 Cài đặt & Chạy dự án

### 1️⃣ Cài đặt dependencies
```sh
npm install
```

### 2️⃣ Chạy dự án ở chế độ development
```sh
npm start
```
Mặc định server chạy tại `http://localhost:8080/`.

### 3️⃣ Build production
```sh
npm run build
```
Code sẽ được xuất ra thư mục `build/`.

## 📂 Cấu trúc thư mục
```
./
├── build/               # Thư mục chứa file build
├── src/                 # Thư mục chứa code nguồn
│   ├── components/      # Các component React
│   ├── index.tsx        # File chính của ứng dụng
│   ├── App.tsx          # Component chính
│   └── styles.css       # File CSS
├── webpack.config.js    # Cấu hình Webpack
├── .prettierrc          # Cấu hình Prettier
├── .eslintrc.js         # Cấu hình ESLint
├── package.json         # Cấu hình npm
└── README.md            # File hướng dẫn
```

## 🎯 Các tính năng chính
✅ Cấu hình Webpack tối ưu cho React.  
✅ Hỗ trợ TypeScript.  
✅ Hỗ trợ SCSS/CSS.  
✅ Tích hợp Babel để chuyển đổi ES6+.  
✅ Tự động reload với Webpack Dev Server.  

## 📌 Ghi chú
Nếu gặp lỗi khi chạy, hãy thử:
```sh
rm -rf node_modules package-lock.json
npm install
```

## 📜 License
MIT

