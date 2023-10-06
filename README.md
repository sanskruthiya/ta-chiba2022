# Geographic Record of Traffic Accident in Chiba prefecture
警察庁オープンデータ(2019年〜2022年)を利用した、千葉県内の交通事故発生箇所のウェブマップです。

- ウェブ地図：[リンク](https://kashiwa.co-place.com/cmap/ta-chiba/)
- データ出典元：[警察庁オープンデータ](https://www.npa.go.jp/publications/statistics/koutsuu/opendata/index_opendata.html )

### 作成要領
1. [警察庁オープンデータ](https://www.npa.go.jp/publications/statistics/koutsuu/opendata/index_opendata.html )サイトより2019年〜2022年の交通事故記録（本票）を取得して整形
- 整形済みデータは[こちらのリポジトリ](https://github.com/sanskruthiya/ta-jp2022)に格納しています。
- 今回は、上記リポジトリのgpkgフォルダ内の千葉県データ（GeoPackage形式）のみ利用しています。

2. GISでデータを変換
- まず、QGISでGeoPackage形式のデータを読み込み、集計対象となる属性値に応じてフラグ立てをした属性項目を追加した上で、それをGeoJSON形式に変換
- 次に、そのGeoJSONデータを[Tippecanoe](https://github.com/felt/tippecanoe)を使ってベクトルタイル化
    - その際に、クラスタリングするものとしないもので2種類のベクトルタイルを生成しています。それぞれの実行時パラメータは下記の通り。
        - クラスタリングなし
        > tippecanoe -zg -o ta_chiba_point.pmtiles --no-tile-compression --drop-densest-as-needed --extend-zooms-if-still-dropping ta_chiba_point.geojson
        - クラスタリングあり
        > tippecanoe -zg -o ta_chiba_flags_clustered.pmtiles --no-tile-compression -r1 --cluster-distance=50 --cluster-densest-as-needed --accumulate-attribute='{"case_flag":"sum", "night_flag":"sum", "junior_flag":"sum", "senior_flag":"sum", "pedestrian_flag":"sum"}' ta_chiba_flags.geojson

3. ウェブ地図の作成
- [MapLibre GL JS](https://maplibre.org/projects/maplibre-gl-js/)によるウェブマップ化を実施
- 基本的なコードは[MapLibre GL JS Example](https://maplibre.org/maplibre-gl-js/docs/examples/cluster-html/)を参考にしつつ、ベクトルタイルの仕様に合わせて作成しています。
