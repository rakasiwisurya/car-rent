# Car Rent

Aplikasi Backend sederhana untuk melakukan penyewaan mobil yang kamu butuhkan.

## Feature

Fitur dasar yang digunakan dalam aplikasi agar dapat membantu ataupun memudahkan user dalam menggunakan aplikasi.

### v.1.0

- Terdapat 2 autentikasi user di dalam aplikasi ini, yaitu administrator dan client, dimana adminstrator merupakan super user yang dalam melakukan segala hal di aplikasi ini salah satukan melakukan CRUD dan booking/renting mobil, sedangkan user client hanya dapat melakukan penyewaan mobil saja tanpa bisa merubah ataupun menambah data.

- Terdapat list Home yang berada di sidebar yang berguna memilih mobil yang akan disewa dan untuk menampilkan detail spesifikasi mobil.

- Terdapat list Rent yang berada di sidebar yang hanya dapat digunakan oleh user administrator, yang berguna untuk menampilkan data penyewaan mobil yang sedang disewa, dan user adimintrator dapat memanipulasi data tersebut contohnya seperti melakukan edit maupun delete data.

- Terdapat list Type dan Brand yang berada di sidebar yang hanya dapat digunakan oleh user administrator, yang berguna untuk menampilkan data tipe mobil contohnya seperti tipe mobil MPV, Sport, Jeep, Sedan, dan lain sebagainya. Dan brand mobil contohnya seperti Hyundai, Lambhorgini, Honda, BMW, Ferrari, dan lain sebagainya. Begitupun juga seperti fitur lainnya user adimintrator juga dapat memanipulasi data tersebut contohnya seperti melakukan edit maupun delete data.

- Terdapat fitur menambahkan image yang hanya dapat digunakan oleh user administrator yang akan disimpan di folder uploads untuk penyimpanan lokal gambar menggunakan package npm "multer".

- Terdapat fitur login dan register agar user dapat membuat user secara mandiri dan login secara mandiri. Terkait security, aplikasi ini sudah disediakan fitur password hash menggunakan package npm "bcrypt".
