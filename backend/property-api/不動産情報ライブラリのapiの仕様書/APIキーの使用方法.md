API操作説明
目次
1. 不動産情報ライブラリの公開APIについて
2. API利用申請の案内
3. HTTPSリクエストにおけるAPIキーの扱いについて
4. 不動産価格（取引価格・成約価格）情報取得API
5. 都道府県内市区町村一覧取得API
6. 鑑定評価書情報API
7. 不動産価格（取引価格・成約価格）情報のポイント (点) API
8. 地価公示・地価調査のポイント（点）API
9. 都市計画決定GISデータ（都市計画区域/区域区分）API
10. 都市計画決定GISデータ（用途地域）API
11. 都市計画決定GISデータ（立地適正化計画）API
12. 国土数値情報（小学校区）API
13. 国土数値情報（中学校区）API
14. 国土数値情報（学校）API
15. 国土数値情報（保育園・幼稚園等）API
16. 国土数値情報（医療機関）API
17. 国土数値情報（福祉施設）API
18. 国土数値情報（将来推計人口250mメッシュ）API
19. 都市計画決定GISデータ（防火・準防火地域）API
20. 国土数値情報（駅別乗降客数）API
21. 国土数値情報（災害危険区域）API
22. 国土数値情報（図書館）API
23. 国土数値情報（市区町村役場及び集会施設等）API
24. 国土数値情報（自然公園地域）API
25. 国土数値情報（大規模盛土造成地マップ）API
26. 国土数値情報（地すべり防止地区）API
27. 国土数値情報（急傾斜地崩壊危険区域）API
28. 都市計画決定GISデータ（地区計画）API
29. 都市計画決定GISデータ（高度利用地区）API
30. 国土交通省都市局（地形区分に基づく液状化の発生傾向図）API
31. 国土数値情報（人口集中地区）API
1. 不動産情報ライブラリの公開APIについて
　不動産情報ライブラリ（以下、本システム）では、Webサービスや研究開発等にご活用いただくため、不動産取引価格情報や地価公示・地価調査、国土数値情報等のデータを公開APIとして提供しています。

　不動産情報ライブラリのAPIを実行するためには、API実行環境が必要になります。

API実行環境の構築には、基本的にHTTPクライアントツールを使用します。HTTPクライアントツールをご用意いただき、API操作説明（https://www.reinfolib.mlit.go.jp/help/apiManual/#titleApi1）を参考にHTTPリクエストヘッダーにサブスクリプションキーを入力してください。また、HTTPクライアントツールの利用方法については固有の製品マニュアル等を参照してください。

　本システムの公開APIの入力情報はHTTPSプロトコルで受信します。出力形式はJSON・GeoJSON・バイナリベクトルタイルのいずれかです。出力形式のフォーマット等の取得したいデータの条件を指定したURLを送信すると、リクエストされた条件やフォーマット等に合致するデータを該当する出力形式で返戻します。

　本システムでは下記のAPIを公開しています。このうち、1. 不動産価格（取引価格・成約価格）情報取得API及び2. 都道府県内市区町村一覧取得APIについては、英語版のデータ返戻にも対応しています。


1. 不動産価格（取引価格・成約価格）情報取得API
2. 都道府県内市区町村一覧取得API
3. 鑑定評価書情報API
4. 不動産価格（取引価格・成約価格）情報のポイント (点) API
5. 地価公示・地価調査のポイント（点）API
6. 都市計画決定GISデータ（都市計画区域/区域区分）API
7. 都市計画決定GISデータ（用途地域）API
8. 都市計画決定GISデータ（立地適正化計画）API
9. 国土数値情報（小学校区）API
10. 国土数値情報（中学校区）API
11. 国土数値情報（学校）API
12. 国土数値情報（保育園・幼稚園等）API
13. 国土数値情報（医療機関）API
14. 国土数値情報（福祉施設）API
15. 国土数値情報（将来推計人口250mメッシュ）API
16. 都市計画決定GISデータ（防火・準防火地域）API
17. 国土数値情報（駅別乗降客数）API
18. 国土数値情報（災害危険区域）API
19. 国土数値情報（図書館）API
20. 国土数値情報（市区町村役場及び集会施設等）API
21. 国土数値情報（自然公園地域）API
22. 国土数値情報（大規模盛土造成地マップ）API
23. 国土数値情報（地すべり防止地区）API
24. 国土数値情報（急傾斜地崩壊危険区域）API
25. 都市計画決定GISデータ（地区計画）API
26. 都市計画決定GISデータ（高度利用地区）API
27. 国土交通省都市局（地形区分に基づく液状化の発生傾向図）API
28. 国土数値情報（人口集中地区）API
　以下で、API利用申請の案内とAPIキーの扱い及び本システムの公開APIそれぞれの操作説明を掲載しております。

2. API利用申請の案内
ここでは本システムで公開しているAPI利用申請の説明を掲載しております。
項目名	利用用途	備考
利用者種別	利用者種別は、反社会的勢力に該当しないか等のAPIキー払い出しの審査、またAPI利用者の属性を把握するために使用します。	
法人番号をお持ちの団体に所属する方は「法人」を選択してください。
法人番号を持たない団体に所属する方は「法人以外の団体」を選択してください。
個人的なご利用を希望される方は「個人」を選択してください。
氏名	発行したAPIキーの通知、また過剰アクセス時の注意喚起時の連絡先として使用します。	
メールアドレス	発行したAPIキーの通知、また過剰アクセス時の注意喚起時の連絡先として使用します。	
利用目的	不適切な利用目的でないか等のAPIキー払い出しの審査、またAPI利用者の属性を把握するために使用します。	
法人または団体名	反社会的勢力に該当しないか等のAPIキー払い出しの審査に使用します。	利用者種別が「法人」または「法人以外の団体」の方はご記入ください。
法人番号	反社会的勢力に該当しないか等のAPIキー払い出しの審査に使用します。	利用者種別が「法人」の方はご記入ください。
法人番号は国税庁 法人番号公表サイトからご確認ください。
国税庁 法人番号公表サイト新規タブで開く
所属	同一の法人または団体から複数の申請があった場合にAPIキー払い出しの審査に利用することがあります。	
所在地	反社会的勢力に該当しないか等のAPIキー払い出しの審査に使用します。	利用者種別が「法人」または「法人以外の団体」の方はご記入ください。
3. HTTPSリクエストにおけるAPIキーの扱いについて
　API利用申請が承認されると、登録したメールアドレスに認証情報としてAPIキーが通知されます。公開APIからデータを取得するためにはHTTPリクエストにAPIキーを設定する必要があり、ここではその設定方法について説明します。

リクエストヘッダーへのAPIキーの設定について
　本システムの公開APIへアクセスするには、APIキーをリクエストヘッダーOcp-Apim-Subscription-Keyに設定する必要があります。

　リクエストヘッダーにAPIキーが設定されていないと、リクエストしたデータは返却されず、401 Unauthorizedのエラーとなります。

※APIキーは利用申請していただくことで、発行されます。
リクエストヘッダー	値
Ocp-Apim-Subscription-Key	{APIキー}
エラーについて
　本システムの公開APIのエラーは、レスポンスヘッダーのステータスコードとメッセージで表現されます。

　4xx Client Errorについては、下記をご参照ください。

　5xx Server Errorについては、恐縮ですが、お問い合わせいただけますと幸いです。

・400 Bad Request

　本システムの公開APIに必要なパラメータが正しく設定されていないときに発生します。必須パラメータの設定が漏れていないか、正しいフォーマットで設定できているか、等をご確認ください。

・401 Unauthorized

　リクエストヘッダーにAPIキーが無いとき、ご指定のAPIキーが無効なときなどに発生します。

・404 Not Found

　本システムの公開APIにご指定のURLに該当するAPIが無いときに発生します。APIのアドレスに誤りはないかをご確認ください。

4. 不動産価格（取引価格・成約価格）情報取得API
下記パラメータを指定することで、不動産価格（取引価格・成約価格）情報を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
priceClassification	価格情報区分コード	形式はNN（数字2桁）
01 … 不動産取引価格情報のみ
02 … 成約価格情報のみ
未指定 … 不動産取引価格情報と成約価格情報の両方	
year	取引時期（年）	形式はYYYY（数字4桁）
YYYY … 西暦
※取引価格は2005（2005年は第3四半期（7~9月）と第4四半期（10~12月）のみ）より指定可能
※成約価格は2021より指定可能	○
quarter	取引時期（四半期）	形式はN（数字1桁）
N … 1～4（1:1月～3月、2:4月～6月、3:7月～9月、4:10月～12月）	
area	都道府県コード	形式はNN（数字2桁）
NN … 都道府県コード
都道府県コードの詳細は、「5. 都道府県内市区町村一覧取得API」の＜参考＞を参照。	
city	市区町村コード	形式はNNNNN（数字5桁）
NNNNN … 全国地方公共団体コードの上5桁	
station	駅コード	形式はNNNNNN（数字6桁）
NNNNNN … 駅コード
国土数値情報の駅データ（鉄道データの下位クラス）のグループコード（N02_005g）を指定します。

https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-v3_1.htmlを参照。	
language	出力結果の言語	ja…日本語
en…英語
未指定…日本語	
※area, city, stationのうち、少なくとも一つは値を指定する必要があります。
＜出力＞
出力形式：JSON形式

※出力するJSON形式のデータはgzipでエンコードされているため、クライアントでデコードを必要とする場合があります。

タグ名	内容	備考
Type	取引の種類（日本語）	
Type	取引の種類（英語）	
Region	地区（日本語）	
Region	地区（英語）	
MunicipalityCode	市区町村コード	
Prefecture	都道府県名（日本語）	
Prefecture	都道府県名（英語）	
Municipality	市区町村名（日本語）	
Municipality	市区町村名（英語）	
DistrictName	地区名（日本語）	
DistrictName	地区名（英語）	
TradePrice	取引価格（総額）	
PricePerUnit	坪単価	
FloorPlan	間取り（日本語）	
FloorPlan	間取り（英語）	
Area	面積（平方メートル）	
UnitPrice	取引価格（平方メートル単価）	
LandShape	土地の形状（日本語）	
LandShape	土地の形状（英語）	
Frontage	間口	
TotalFloorArea	延床面積（平方メートル）	
BuildingYear	建築年（日本語）	
BuildingYear	建築年（英語）	
Structure	建物の構造（日本語）	
Structure	建物の構造（英語）	
Use	用途（日本語）	
Use	用途（英語）	
Purpose	今後の利用目的（日本語）	
Purpose	今後の利用目的（英語）	
Direction	前面道路：方位（日本語）	
Direction	前面道路：方位（英語）	
Classification	前面道路：種類（日本語）	
Classification	前面道路：種類（英語）	
Breadth	前面道路：幅員（m）	
CityPlanning	都市計画（日本語）	
CityPlanning	都市計画（英語）	
CoverageRatio	建蔽率（%）	
FloorAreaRatio	容積率（%）	
Period	取引時点（日本語）	
Period	取引時点（英語）	
Renovation	改装（日本語）	
Renovation	改装（英語）	
Remarks	取引の事情等（日本語）	
Remarks	取引の事情等（英語）	
＜使用例＞
パラメータの組み合わせは下記の通りです。
1. 「取引時期Year」&「都道府県コード」
https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?year=2015&area=13
平成27年　東京都の不動産価格（取引価格・成約価格）情報を取得する。

2. 「取引時期Year」&「取引時期Quarter」&「市区町村コード」&「不動産取引価格情報」
https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?year=2015&quarter=2&city=13102&priceClassification=01
平成27年第2四半期　東京都中央区の不動産取引価格情報を取得する。

3. 「取引時期Year」&「取引時期Quarter」&「駅コード」&「成約価格情報」
https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?year=2023&quarter=4&station=003785&priceClassification=02
令和5年第4四半期　東京駅周辺の成約価格情報を取得する。

＜出力例＞
JSONで出力されます。



5. 都道府県内市区町村一覧取得API
下記パラメータを指定することで、都道府県内市区町村一覧を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
area	都道府県コード	形式はNN（数字2桁）
NN…都道府県コード	○
language	出力結果の言語	ja…日本語
en…英語
未指定…日本語	
＜出力＞
出力形式：JSON形式

※出力するJSON形式のデータはgzipでエンコードされているため、クライアントでデコードを必要とする場合があります。

タグ名	内容	備考
id	市区町村コード	
name	市区町村名（日本語）	
name	市区町村名（英語）	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002?area=13
東京都内の市区町村一覧を取得する。

＜出力例＞
JSONで出力されます。



＜参考＞　都道府県コード一覧
本ウェブサイトで使用している都道府県コードと都道府県名の一覧は下記の通りです。

コード	日本語表記	英語表記
01	北海道	Hokkaido
02	青森県	Aomori Prefecture
03	岩手県	Iwate Prefecture
04	宮城県	Miyagi Prefecture
05	秋田県	Akita Prefecture
06	山形県	Yamagata Prefecture
07	福島県	Fukushima Prefecture
08	茨城県	Ibaraki Prefecture
09	栃木県	Tochigi Prefecture
10	群馬県	Gunma Prefecture
11	埼玉県	Saitama Prefecture
12	千葉県	Chiba Prefecture
13	東京都	Tokyo
14	神奈川県	Kanagawa Prefecture
15	新潟県	Niigata Prefecture
16	富山県	Toyama Prefecture
17	石川県	Ishikawa Prefecture
18	福井県	Fukui Prefecture
19	山梨県	Yamanashi Prefecture
20	長野県	Nagano Prefecture
21	岐阜県	Gifu Prefecture
22	静岡県	Shizuoka Prefecture
23	愛知県	Aichi Prefecture
24	三重県	Mie Prefecture
25	滋賀県	Shiga Prefecture
26	京都府	Kyoto Prefecture
27	大阪府	Osaka Prefecture
28	兵庫県	Hyogo Prefecture
29	奈良県	Nara Prefecture
30	和歌山県	Wakayama Prefecture
31	鳥取県	Tottori Prefecture
32	島根県	Shimane Prefecture
33	岡山県	Okayama Prefecture
34	広島県	Hiroshima Prefecture
35	山口県	Yamaguchi Prefecture
36	徳島県	Tokushima Prefecture
37	香川県	Kagawa Prefecture
38	愛媛県	Ehime Prefecture
39	高知県	Kochi Prefecture
40	福岡県	Fukuoka Prefecture
41	佐賀県	Saga Prefecture
42	長崎県	Nagasaki Prefecture
43	熊本県	Kumamoto Prefecture
44	大分県	Oita Prefecture
45	宮崎県	Miyazaki Prefecture
46	鹿児島県	Kagoshima Prefecture
47	沖縄県	Okinawa Prefecture
6. 鑑定評価書情報API
下記パラメータを指定することで、鑑定評価書情報を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
year	価格時点	形式はYYYY（数字4桁） YYYY…西暦
※2021~2025を指定可能（最新年から5年分のみ）	○
area	都道府県コード	形式はNN（数字2桁）
NN…都道府県コード

都道府県コードの詳細は、「5. 都道府県内市区町村一覧取得API」の＜参考＞を参照。	○
division	用途区分	形式はNN（数字2桁）
00…住宅地
03…宅地見込地
05…商業地
07…準工業地
09…工業地
10…調整区域内宅地
13…現況林地
20…林地（都道府県地価調査）	○
＜出力＞
出力形式：JSON形式

※出力するJSON形式のデータはgzipでエンコードされているため、クライアントでデコードを必要とする場合があります。

フィールド名（内容）	備考
価格時点	
標準地番号　市区町村コード　県コード	
標準地番号　市区町村コード　市区町村コード	
標準地番号　地域名	
標準地番号　用途区分コード	
標準地番号　連番	
1㎡当たりの価格	
路線価　年	
路線価　相続税路線価	
路線価　倍率	
路線価　倍率種別	
標準地　所在地　所在地番	
標準地　所在地　住居表示	
標準地　所在地　仮換地番号	
標準地　地積　地積	
標準地　地積　内私道分	
標準値　形状　形状	
標準地　形状　形状比　間口	
標準地　形状　形状比　奥行	
標準地　形状　方位	
標準地　形状　平坦	
標準地　形状　傾斜度	
標準地　土地利用の現況　現況	
標準地　土地利用の現況　構造コード	
標準地　土地利用の現況　地上階数	
標準地　土地利用の現況　地下階数	
標準地　周辺の利用状況	
標準地　接面道路の状況　前面道路　方位	
標準地　接面道路の状況　前面道路　駅前区分	
標準地　接面道路の状況　前面道路　高低位置	
標準地　接面道路の状況　前面道路　道路幅員	
標準地　接面道路の状況　前面道路　舗装状況	
標準地　接面道路の状況　前面道路　道路種別	
標準地　接面道路の状況　側道方位	
標準地 接面道路の状況 側道等接面状況	
標準地　供給処理施設　水道	
標準地　供給処理施設　ガス	
標準地　供給処理施設　下水道	
標準地　交通施設の状況　交通施設	
標準地　交通施設の状況　距離	
標準地　交通施設の状況　近接区分	
標準地　法令上の規制等　区域区分	
標準地　法令上の規制等　用途地域	
標準地　法令上の規制等　指定建蔽率	
標準地　法令上の規制等　指定容積率	
標準地　法令上の規制等　防火地域	
標準地　法令上の規制等　森林法	
標準地　法令上の規制等　自然公園法	
標準地　法令上の規制等　その他　その他地域地区等1	
標準地　法令上の規制等　その他　その他地域地区等2	
標準地　法令上の規制等　その他　その他地域地区等3	
標準地　法令上の規制等　その他　高度地区1　種	
標準地　法令上の規制等　その他　高度地区1　高度区分	
標準地　法令上の規制等　その他　高度地区1　高度	
標準地　法令上の規制等　その他　高度地区2　種	
標準地　法令上の規制等　その他　高度地区2　高度区分	
標準地　法令上の規制等　その他　高度地区2　高度	
標準地　法令上の規制等　その他　基準建蔽率	
標準地　法令上の規制等　その他　基準容積率	
標準地　法令上の規制等　自然環境等コード1	
標準地　法令上の規制等　自然環境等コード2	
標準地　法令上の規制等　自然環境等コード3	
標準地　法令上の規制等　自然環境等文言	
鑑定評価手法の適用 取引事例比較法比準価格	
鑑定評価手法の適用 控除法　控除後価格	
鑑定評価手法の適用 収益還元法 収益価格	
鑑定評価手法の適用 原価法 積算価格	
鑑定評価手法の適用 開発法 開発法による価格	
比準価格算定内訳事例a 取引価格	
比準価格算定内訳事例a 推定価格	
比準価格算定内訳事例a 標準価格	
比準価格算定内訳事例a 査定価格	
比準価格算定内訳事例b 取引価格	
比準価格算定内訳事例b 推定価格	
比準価格算定内訳事例b 標準価格	
比準価格算定内訳事例b 査定価格	
比準価格算定内訳事例c 取引価格	
比準価格算定内訳事例c 推定価格	
比準価格算定内訳事例c 標準価格	
比準価格算定内訳事例c 査定価格	
比準価格算定内訳事例d 取引価格	
比準価格算定内訳事例d 推定価格	
比準価格算定内訳事例d 標準価格	
比準価格算定内訳事例d 査定価格	
比準価格算定内訳事例e 取引価格	
比準価格算定内訳事例e 推定価格	
比準価格算定内訳事例e 標準価格	
比準価格算定内訳事例e 査定価格	
積算価格算定内訳素地の取得価格	
積算価格算定内訳造成工事費	
積算価格算定内訳再調達原価	
収益価格算定内訳総収益	
収益価格算定内訳総費用	
収益価格算定内訳純収益	
収益価格算定内訳建物に帰属する純収益	
収益価格算定内訳土地に帰属する純収益	
収益価格算定内訳未収入期間修正後の純収益	
収益価格算定内訳還元利回り	
開発法価格算定内訳 収入の現価の総和	
開発法価格算定内訳 支出の現価の総和	
開発法価格算定内訳 投下資本収益率	
開発法価格算定内訳 販売単価(住宅)	
開発法価格算定内訳 分譲可能床面積	
開発法価格算定内訳 建築工事費	
開発法価格算定内訳 延床面積	
公示価格	
変動率	
緯度	
経度	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001?year=2022&area=01&division=00
2022年　北海道　住宅地の鑑定評価書情報を取得する。

＜出力例＞
JSONで出力されます。



7. 不動産価格（取引価格・成約価格）情報のポイント (点) API
下記パラメータを指定することで、不動産価格（取引価格・成約価格）情報のポイント（点）データを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XPT001?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
from	取引時期From	形式はYYYYN（数字5桁）
YYYY … 西暦
N … 1～4（1:1月～3月、2:4月～6月、3:7月～9月、4:10月～12月）
※取引価格は20053（2005年第3四半期（7~9月））より指定可能
※成約価格は20211（2021年第1四半期（1~3月））より指定可能	○
to	取引時期To	形式はYYYYN（数字5桁）
YYYY … 西暦
N … 1～4（1:1月～3月、2:4月～6月、3:7月～9月、4:10月～12月）
※取引価格は20053（2005年第3四半期（7~9月））より指定可能
※成約価格は20211（2021年第1四半期（1~3月））より指定可能	○
priceClassification	価格情報区分コード	形式はNN（数字2桁）
01 … 不動産取引価格情報のみ
02 … 成約価格情報のみ
未指定 … 不動産取引価格情報と成約価格情報の両方	
landTypeCode	種類コード	形式はNN（数字2桁）
01 … 宅地（土地）
02 … 宅地（土地と建物）
07 … 中古マンション等
10 … 農地
11 … 林地
未指定 … すべて
※複数指定する場合は、「landTypeCode=01,02,07」のようにカンマ区切りで指定してください。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
price_information_cagegory_name_ja	価格情報区分	
district_code	地区コード	
city_code	市区町村コード	
prefecture_name_ja	都道府県名	
city_name_ja	市区町村名	
district_name_ja	地区名	
u_transaction_price_total_ja	取引価格（総額）	
u_unit_price_per_tsubo_ja	坪単価	
floor_plan_name_ja	間取り	
u_area_ja	面積	
u_transaction_price_unit_price_square_meter_ja	取引価格（平方メートル単価）	
land_shape_name_ja	土地の形状	
u_land_frontage_ja	間口	
u_building_total_floor_area_ja	建物の延床面積	
u_construction_year_ja	建築年	
building_structure_name_ja	建物の構造	
land_use_name_ja	用途地域	
future_use_purpose_name_ja	今後の利用目的	
front_road_azimuth_name_ja	前面道路の方位	
front_road_type_name_ja	前面道路の種類	
u_front_road_width_ja	前面道路の幅員	
u_building_coverage_ratio_ja	建蔽率	
u_floor_area_ratio_ja	容積率	
point_in_time_name_ja	取引時点	
remark_renovation_name_ja	改装	
transaction_contents_name_ja	取引の事情等	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XPT001?response_format=geojson&z=13&x=7312&y=3008&from=20223&to=20234
GeoJSON形式　XYZ方式で該当するエリアの取引価格情報のポイント（点）データを取得する。

https://www.reinfolib.mlit.go.jp/ex-api/external/XPT001?response_format=pbf&z=13&x=7312&y=3008&from=20223&to=20234&priceClassification=01&landTypeCode=01,02,07
バイナリベクトルタイル形式　XYZ方式で該当するエリアの取引価格情報のポイント（点）データを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


8. 地価公示・地価調査のポイント（点）API
下記パラメータを指定することで地価公示・地価調査のポイント (点) データを得ることができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XPT002?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
13（大字）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
year	対象年	形式はNNNN（数字4桁）
1995～最新年（システム一般公開時点では2024）で一つのみ指定可能です。	○
priceClassification	地価情報区分コード	形式はN（数字1桁）
0 … 国土交通省地価公示のみ
1 … 都道府県地価調査のみ
未指定 … 国土交通省地価公示と都道府県地価調査の両方	
useCategoryCode	用途区分コード	形式はNN（数字2桁）
00 … 住宅地
03 … 宅地見込地
05 … 商業地
07 … 準工業地
09 … 工業地
10 … 市街地調整区域内の現況宅地
13 … 市街地調整区域内の現況林地（国土交通省地価公示のみ）
20 … 林地（都道府県地価調査のみ）
未指定 … すべて
※複数指定する場合は、「useCategoryCode=00,03,05」のようにカンマ区切りで指定してください。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
point_id	地点ID	
target_year_name_ja	対象年	
land_price_type	地価区分	
prefecture_code	都道府県コード	
prefecture_name_ja	都道府県名	
city_code	市区町村コード	
use_category_name_ja	用途区分名	
standard_lot_number_ja	標準地/基準地番号	
city_county_name_ja	市郡名	
ward_town_village_name_ja	区町村名	
place_name_ja	地名	
residence_display_name_ja	住居表示	
location_number_ja	所在及び地番	
u_current_years_price_ja	当年価格	
last_years_price	前年価格	
year_on_year_change_rate	対前年変動率	
u_cadastral_ja	地積	
frontage_ratio	間口比率	
depth_ratio	奥行き比率	
building_structure_name_ja	構造	
u_ground_hierarchy_ja	地上階層	
u_underground_hierarchy_ja	地下階層	
front_road_name_ja	前面道路区分	
front_road_azimuth_name_ja	前面道路の方位区分	
front_road_width	前面道路の幅員	
front_road_pavement_condition	前面道路の舗装状況	
side_road_azimuth_name_ja	側道の方位区分	
side_road_name_ja	側道区分	
gas_supply_availability	ガスの有無	
water_supply_availability	水道の有無	
sewer_supply_availability	下水道の有無	
nearest_station_name_ja	最寄り駅名	
proximity_to_transportation_facilities	交通施設との近接区分	
u_road_distance_to_nearest_station_name_ja	最寄り駅までの道路距離	
usage_status_name_ja	利用現況	
current_usage_status_of_surrounding_land_name_ja	周辺の土地の利用現況	
area_division_name_ja	区域区分	
regulations_use_category_name_ja	法規制・用途区分	
regulations_altitude_district_name_ja	法規制・高度地区	
regulations_fireproof_name_ja	法規制・防火・準防火	
u_regulations_building_coverage_ratio_ja	法規制・建蔽率	
u_regulations_floor_area_ratio_ja	法規制・容積率	
regulations_forest_law_name_ja	法規制・森林法	
regulations_park_law_name_ja	法規制・公園法	
pause_flag	休止フラグ	
usage_category_name_ja	利用区分名	
location	所在及び地番	
shape	形状（間口：奥行き）	
front_road_condition	前面道路の状況	
side_road_condition	その他の接面道路	
park_forest_law	森林法、公園法、自然環境等	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XPT002?response_format=geojson&z=13&x=7312&y=3008&year=2020
GeoJSON形式　XYZ方式で該当するエリアの地価公示・地価調査のポイント（点）データを取得する。

https://www.reinfolib.mlit.go.jp/ex-api/external/XPT002?response_format=pbf&z=13&x=7312&y=3008&year=2020&priceClassification=0&useCategoryCode=00,03,05
バイナリベクトルタイル形式　XYZ方式で該当するエリアの地価公示・地価調査のポイント（点）データを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


9. 都市計画決定GISデータ（都市計画区域/区域区分）API
下記パラメータを指定することで、都市計画決定GISデータ（都市計画区域/区域区分）を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT001?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
prefecture	都道府県名	
city_code	市区町村コード	
city_name	市区町村名	
kubun_id	区分コード	
decision_date	設定年月日	最終告示日
decision_classification	設定区分	
decision_maker	設定者名	
notice_number	告示番号	告示番号L（告示番号（最終））
area_classification_ja	区域区分	
first_decision_date	当初決定日	
notice_number_s	告示番号S	告示番号（当初）
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT001?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの都市計画決定GISデータ（都市計画区域/区域区分）を取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT001?response_format=pbf&z=11&x=1819&y=806
バイナリベクトルタイル形式　XYZ方式で該当するエリアの都市計画決定GISデータ（都市計画区域/区域区分）を取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


10. 都市計画決定GISデータ（用途地域）API
下記パラメータを指定することで、都市計画決定GISデータ（用途地域）を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT002?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
youto_id	用途地域分類	
prefecture	都道府県名	
city_code	市区町村コード	
city_name	市区町村名	
decision_date	区域設定年月日	最終告示日
decision_classification	設定区分	
decision_maker	設定者名	
notice_number	告示番号	告示番号L（告示番号（最終））
use_area_ja	用途地域名	
u_floor_area_ratio_ja	容積率	
u_building_coverage_ratio_ja	建蔽率	
first_decision_date	当初決定日	
notice_number_s	告示番号S	告示番号（当初）
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT002?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの都市計画決定GISデータ（用途地域）を取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT002?response_format=pbf&z=11&x=1819&y=806
バイナリベクトルタイル形式　XYZ方式で該当するエリアの都市計画決定GISデータ（用途地域）を取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


11. 都市計画決定GISデータ（立地適正化計画）API
下記パラメータを指定することで、都市計画決定GISデータ（立地適正化計画）を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT003?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
prefecture	都道府県名	
city_code	行政区域コード	
city_name	市町村名	
decision_date	区域設定年月日	最終告示日
decision_classification	設定区分	
decision_maker	設定者名	
notice_number	告示番号	告示番号L（告示番号（最終））
kubun_id	区域コード	
kubun_name_ja	区域名	
area_classification_ja	区域区分	
first_decision_date	当初決定日	
notice_number_s	告示番号S	告示番号（当初）
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT003?response_format=geojson&z=11&x=1818&y=805
GeoJSON形式　XYZ方式で該当するエリアの都市計画決定GISデータ（立地適正化計画）を取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT003?response_format=pbf&z=11&x=1818&y=805
バイナリベクトルタイル形式　XYZ方式で該当するエリアの都市計画決定GISデータ（立地適正化計画）を取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


12. 国土数値情報（小学校区）API
下記パラメータを指定することで、国土数値情報（小学校区）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT004?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
administrativeAreaCode	行政区域コード	形式はNNNNN（数字5桁）
※複数指定する場合は、「administrativeAreaCode=13101,13102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsxを参照。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
A27_001	行政区域コード	
A27_002	設置主体	
A27_003	学校コード	
A27_004_ja	名称	
A27_005	所在地	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT004?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（小学校区）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT004?response_format=pbf&z=11&x=1819&y=806&administrativeAreaCode=13108
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、東京都江東区の国土数値情報（小学校区）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


13. 国土数値情報（中学校区）API
下記パラメータを指定することで、国土数値情報（中学校区）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT005?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
administrativeAreaCode	行政区域コード	形式はNNNNN（数字5桁）
※複数指定する場合は、「administrativeAreaCode=13101,13102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsxを参照。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
A32_001	行政区域コード	
A32_002	設置主体	
A32_003	学校コード	
A32_004_ja	名称	
A32_005	所在地	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT005?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（中学校区）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT005?response_format=pbf&z=11&x=1819&y=806&administrativeAreaCode=13108
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、東京都江東区の国土数値情報（中学校区）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


14. 国土数値情報（学校）API
下記パラメータを指定することで、国土数値情報（学校）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT006?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
13（大字）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
P29_001	行政区域コード	
P29_002	学校コード	
P29_003	学校分類コード	
P29_003_name_ja	学校分類名	
P29_004_ja	名称	
P29_005_ja	所在地	
P29_006	管理者コード	
P29_007	休校区分	
P29_008	キャンパスコード	
P29_009_ja	学校名備考	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT006?response_format=geojson&z=13&x=7272&y=3225
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（学校）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT006?response_format=pbf&z=13&x=7272&y=3225
バイナリベクトルタイル形式　XYZ方式で該当するエリアの国土数値情報（学校）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


15. 国土数値情報（保育園・幼稚園等）API
下記パラメータを指定することで、国土数値情報（保育園・幼稚園等）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT007?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
13（大字）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

(i) 「幼稚園」または「こども園」の場合

タグ名	内容	備考
administrativeAreaCode	行政区域コード	
preSchoolName_ja	名称	
schoolCode	学校コード	
schoolClassCode	学校分類コード	
schoolClassCode_name_ja	学校分類名	
location_ja	所在地	
administratorCode	管理者コード	
closeSchoolCode	休校コード	
(ii) 「保育園」の場合

タグ名	内容	備考
administrativeAreaCode	行政区域コード	
preSchoolName_ja	名称	
welfareFacilityClassCode	福祉施設大分類コード	
welfareFacilityMiddleClassCode	福祉施設中分類コード	
welfareFacilityMinorClassCode	福祉施設小分類コード	
location_ja	所在地	
administratorCode	管理者コード	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT007?response_format=geojson&z=13&x=7272&y=3225
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（保育園・幼稚園等）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT007?response_format=pbf&z=13&x=7272&y=3225
バイナリベクトルタイル形式　XYZ方式で該当するエリアの国土数値情報（保育園・幼稚園等）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


16. 国土数値情報（医療機関）API
下記パラメータを指定することで、国土数値情報（医療機関）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT010?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
13（大字）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
P04_001	医療機関分類	
P04_001_name_ja	医療機関分類名	
P04_002_ja	施設名称	
P04_003_ja	所在地	
P04_004	診療科目１	
P04_005	診療科目２	
P04_006	診療科目３	
P04_007	開設者分類	
P04_008	病床数	
P04_009	救急告示病院	
P04_010	災害拠点病院	
medical_subject_ja	診療科目	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT010?response_format=geojson&z=13&x=7272&y=3225
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（医療機関）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT010?response_format=pbf&z=13&x=7272&y=3225
バイナリベクトルタイル形式　XYZ方式で該当するエリアの国土数値情報（医療機関）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


17. 国土数値情報（福祉施設）API
下記パラメータを指定することで、国土数値情報（福祉施設）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT011?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
13（大字）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
administrativeAreaCode	行政区域コード	形式はNNNNN（数字5桁）
※複数指定する場合は、「administrativeAreaCode=13101,13102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsxを参照。	
welfareFacilityClassCode	福祉施設大分類コード	形式はNN（数字2桁）
※複数指定する場合は、「welfareFacilityClassCode=01,02」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/welfareInstitution_welfareFacilityMajorClassificationCode.htmlを参照。	
welfareFacilityMiddleClassCode	福祉施設中分類コード	形式はNNNN（数字4桁）
※複数指定する場合は、「welfareFacilityMiddleClassCode=0101,0201」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/welfareInstitution_welfareFacilityMiddleClassificationCode.htmlを参照。	
welfareFacilityMinorClassCode	福祉施設小分類コード	形式はNNNNNN（数字6桁）
※複数指定する場合は、「welfareFacilityMinorClassCode=020101,020102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/welfareInstitution_welfareFacilityMinorClassificationCode.htmlを参照。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
P14_001	都道府県名	
P14_002	市区町村名	
P14_003	行政区域コード	
P14_004_ja	所在地	
P14_005	福祉施設大分類コード	
P14_005_name_ja	福祉施設大分類名	
P14_006	福祉施設中分類コード	
P14_006_name_ja	福祉施設中分類名	
P14_007	福祉施設小分類コード	
P14_008_ja	名称	
P14_009	管理者コード	
P14_010	位置正確度コード	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT011?response_format=geojson&z=13&x=7272&y=3225
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（福祉施設）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT011?response_format=pbf&z=13&x=7272&y=3225&administrativeAreaCode=13204&welfareFacilityClassCode=05&welfareFacilityMiddleClassCode=0513&welfareFacilityMinorClassCode=051301
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、東京都三鷹市の小型児童館の国土数値情報（福祉施設）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


18. 国土数値情報（将来推計人口250mメッシュ）API
下記パラメータを指定することで、国土数値情報（将来推計人口250mメッシュ）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT013?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
MESH_ID	分割地域メッシュコード	
SHICODE	行政区域コード	
PTN_20XX	20XX年男女計総数人口（秘匿なし）	
HITOKU20XX	20XX年秘匿記号	
GASSAN20XX	20XX年合算先メッシュ	
PT00_20XX	20XX年男女計総数人口	
PT01_20XX	20XX年男女計0～4歳人口	
PT02_20XX	20XX年男女計5～9歳人口	
PT03_20XX	20XX年男女計10～14歳人口	
PT04_20XX	20XX年男女計15～19歳人口	
PT05_20XX	20XX年男女計20～24歳人口	
PT06_20XX	20XX年男女計25～29歳人口	
PT07_20XX	20XX年男女計30～34歳人口	
PT08_20XX	20XX年男女計35～39歳人口	
PT09_20XX	20XX年男女計40～44歳人口	
PT10_20XX	20XX年男女計45～49歳人口	
PT11_20XX	20XX年男女計50～54歳人口	
PT12_20XX	20XX年男女計55～59歳人口	
PT13_20XX	20XX年男女計60～64歳人口	
PT14_20XX	20XX年男女計65～69歳人口	
PT15_20XX	20XX年男女計70～74歳人口	
PT16_20XX	20XX年男女計75～79歳人口	
PT17_20XX	20XX年男女計80～84歳人口	
PT18_20XX	20XX年男女計85～89歳人口	
PT19_20XX	20XX年男女計90～94歳人口	
PT20_20XX	20XX年男女計95歳以上人口	
PTA_20XX	20XX年男女計0～14歳人口	
PTB_20XX	20XX年男女計15～64歳人口	
PTC_20XX	20XX年男女計65歳以上人口	
PTD_20XX	20XX年男女計75歳以上人口	
PTE_20XX	20XX年男女計80歳以上人口	
RTA_20XX	20XX年男女計0～14歳人口比率	
RTB_20XX	20XX年男女計15～64歳人口比率	
RTC_20XX	20XX年男女計65歳以上人口比率	
RTD_20XX	20XX年男女計75歳以上人口比率	
RTE_20XX	20XX年男女計80歳以上人口比率	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT013?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（将来推計人口250mメッシュ）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT013?response_format=pbf&z=11&x=1819&y=806
バイナリベクトルタイル形式　XYZ方式で該当するエリアの国土数値情報（将来推計人口250mメッシュ）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


19. 都市計画決定GISデータ（防火・準防火地域）API
下記パラメータを指定することで、都市計画決定GISデータ（防火・準防火地域）を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT014?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
fire_prevention_ja	防火・準防火地域名	
kubun_id	区分コード	
prefecture	都道府県名	
city_code	市区町村コード	
city_name	市区町村名	
decision_date	設定年月日	最終告示日
decision_classification	設定区分	
decision_maker	設定者名	
notice_number	告示番号	告示番号L（告示番号（最終））
first_decision_date	当初決定日	
notice_number_s	告示番号S	告示番号（当初）
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT014?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの都市計画決定GISデータ（防火・準防火地域）を取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT014?response_format=pbf&z=11&x=1819&y=806
バイナリベクトルタイル形式　XYZ方式で該当するエリアの都市計画決定GISデータ（防火・準防火地域）を取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


20. 国土数値情報（駅別乗降客数）API
下記パラメータを指定することで、国土数値情報（駅別乗降客数）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT015?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
S12_001_ja	駅名	
S12_001c	駅コード	
S12_001g	グループコード	
S12_002_ja	運営会社	
S12_003_ja	路線名	
S12_004	鉄道区分	
S12_005	事業者種別	
S12_006	重複コード2011	
S12_007	データ有無コード2011	
S12_008	備考2011	
S12_009	乗降客数2011	
S12_010	重複コード2012	
S12_011	データ有無コード2012	
S12_012	備考2012	
S12_013	乗降客数2012	
S12_014	重複コード2013	
S12_015	データ有無コード2013	
S12_016	備考2013	
S12_017	乗降客数2013	
S12_018	重複コード2014	
S12_019	データ有無コード2014	
S12_020	備考2014	
S12_021	乗降客数2014	
S12_022	重複コード2015	
S12_023	データ有無コード2015	
S12_024	備考2015	
S12_025	乗降客数2015	
S12_026	重複コード2016	
S12_027	データ有無コード2016	
S12_028	備考2016	
S12_029	乗降客数2016	
S12_030	重複コード2017	
S12_031	データ有無コード2017	
S12_032	備考2017	
S12_033	乗降客数2017	
S12_034	重複コード2018	
S12_035	データ有無コード2018	
S12_036	備考2018	
S12_037	乗降客数2018	
S12_038	重複コード2019	
S12_039	データ有無コード2019	
S12_040	備考2019	
S12_041	乗降客数2019	
S12_042	重複コード2020	
S12_043	データ有無コード2020	
S12_044	備考2020	
S12_045	乗降客数2020	
S12_046	重複コード2021	
S12_047	データ有無コード2021	
S12_048	備考2021	
S12_049	乗降客数2021	
S12_050	重複コード2022	
S12_051	データ有無コード2022	
S12_052	備考2022	
S12_053	乗降客数2022	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT015?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（駅別乗降客数）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT015?response_format=pbf&z=11&x=1819&y=806
バイナリベクトルタイル形式　XYZ方式で該当するエリアの国土数値情報（駅別乗降客数）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


21. 国土数値情報（災害危険区域）API
下記パラメータを指定することで、国土数値情報（災害危険区域）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT016?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
administrativeAreaCode	代表行政コード	形式はNNNNN（数字5桁）
※複数指定する場合は、「administrativeAreaCode=13101,13102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsxを参照。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
A48_001	都道府県名	
A48_002	市町村名	
A48_003	代表行政コード	
A48_004	指定主体区分	
A48_005_ja	区域名	
A48_006	所在地	
A48_007	指定理由コード	
A48_007_name_ja	指定理由	
A48_008_ja	指定理由詳細	
A48_009	告示年月日	
A48_010	告示番号	
A48_011	根拠条例	
A48_012	面積	
A48_013	縮尺	
A48_014	その他	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT016?response_format=geojson&z=11&x=1819&y=806
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（災害危険区域）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT016?response_format=pbf&z=11&x=1819&y=806&administrativeAreaCode=12203
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、千葉県市川市の国土数値情報（災害危険区域）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


22. 国土数値情報（図書館）API
下記パラメータを指定することで、国土数値情報（図書館）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT017?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
13（大字）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
administrativeAreaCode	行政区域コード	形式はNNNNN（数字5桁）
※複数指定する場合は、「administrativeAreaCode=13101,13102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsxを参照。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
P27_001	行政区域コード	
P27_002	公共施設大分類	
P27_003	公共施設小分類	
P27_003_name_ja	公共施設小分類名	
P27_004	文化施設分類	
P27_004_name_ja	文化施設分類名	
P27_005_ja	名称	
P27_006_ja	所在地	
P27_007	管理者コード	
P27_008	階数	
P27_009	建築年	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT017?response_format=geojson&z=13&x=7272&y=3225
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（図書館）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT017?response_format=pbf&z=13&x=7272&y=3225&administrativeAreaCode=13115
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、東京都杉並区の国土数値情報（図書館）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


23. 国土数値情報（市区町村役場及び集会施設等）API
下記パラメータを指定することで、国土数値情報（市区町村役場及び集会施設等）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT018?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
13（大字）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
P05_001	行政区域コード	
P05_002	施設分類コード	
P05_002_name_ja	施設分類名	
P05_003_ja	名称	
P05_004_ja	所在地	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT018?response_format=geojson&z=13&x=7272&y=3225
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（市区町村役場及び集会施設等）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT018?response_format=pbf&z=13&x=7272&y=3225
バイナリベクトルタイル形式　XYZ方式で該当するエリアの国土数値情報（市区町村役場及び集会施設等）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


24. 国土数値情報（自然公園地域）API
下記パラメータを指定することで、国土数値情報（自然公園地域）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT019?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
9（都道府県）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
prefectureCode	都道府県コード	形式はN（数字1桁）またはNN（数字2桁）
1（北海道）～47（沖縄県）で指定可能です。
※複数指定する場合は、「prefectureCode=13,14」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/PrefCd.htmlにおいて、1桁目が0のものについては、0を取り除いた値で指定してください。	
districtCode	地区コード	振興局区域を一意に識別するためのコードです。形式はN（数字1桁）またはNN（数字2桁）です。
※複数指定する場合は、「districtCode=9,10」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/SubprefectureNameCd.htmlにおいて、1桁目が0のものについては、0を取り除いた値で指定してください。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
OBJECTID	シェープID	
PREFEC_CD	都道府県コード	
AREA_CD	地区コード	
CTV_NAME	市町村名	
FIS_YEAR	年度	
THEMA_NO	主題番号	
LAYER_NO	レイヤ番号	
AREA_SIZE	ポリゴン面積(ha)	
IOSIDE_DIV	内外区分	
REMARK_STR	備考	
Shape_Leng	シェープの長さ	
Shape_Area	シェープの面積	
OBJ_NAME_ja	シェープ名	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT019?response_format=geojson&z=10&x=914&y=376
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（自然公園地域）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT019?response_format=pbf&z=10&x=914&y=376&prefectureCode=1&districtCode=1
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、北海道石狩振興局の国土数値情報（自然公園地域）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


25. 国土数値情報（大規模盛土造成地マップ）API
下記パラメータを指定することで、大規模盛土造成地マップのGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT020?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
embankment_classification	盛土区分	
prefecture_code	都道府県コード	
prefecture_name	都道府県名	
city_code	市区町村コード	
city_name	市区町村名	
embankment_number	盛土番号	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT020?response_format=geojson&z=12&x=3657&y=1504
GeoJSON形式　XYZ方式で該当するエリアの大規模盛土造成地マップのGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT020?response_format=pbf&z=12&x=3657&y=1504
バイナリベクトルタイル形式　XYZ方式で該当するエリアの大規模盛土造成地マップのGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


26. 国土数値情報（地すべり防止地区）API
下記パラメータを指定することで、国土数値情報（地すべり防止地区）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT021?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
prefectureCode	都道府県コード	形式はNN（数字2桁）
※複数指定する場合は、「prefectureCode=13,14」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/PrefCd.htmlを参照。	
administrativeAreaCode	行政コード	形式はNNNNN（数字5桁）
※複数指定する場合は、「administrativeAreaCode=13101,13102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsxを参照。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
prefecture_code	都道府県コード	
group_code	行政コード	
city_name	市町村名	
region_name	区域名	
address	所在地	
notice_date	告示年月日	
notice_number	告示番号	
landslide_area	指定面積（ha）	
charge_ministry_code	所管省庁コード	
prefecture_name	都道府県名	
charge_ministry_name	所管省庁名	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT021?response_format=geojson&z=11&x=1815&y=805
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（地すべり防止地区）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT021?response_format=pbf&z=11&x=1815&y=805&prefectureCode=13&administrativeAreaCode=13308
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、東京都西多摩郡奥多摩町の国土数値情報（地すべり防止地区）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


27. 国土数値情報（急傾斜地崩壊危険区域）API
下記パラメータを指定することで、国土数値情報（急傾斜地崩壊危険区域）のGISデータを取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT022?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
prefectureCode	都道府県コード	形式はNN（数字2桁）
※複数指定する場合は、「prefectureCode=13,14」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/PrefCd.htmlを参照。	
administrativeAreaCode	行政コード	形式はNNNNN（数字5桁）
※複数指定する場合は、「administrativeAreaCode=13101,13102」のようにカンマ区切りで指定してください。

https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsxを参照。	
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
prefecture_code	都道府県コード	
group_code	行政コード	
city_name	市町村名	
region_name	区域名	
address	所在地	
public_notice_date	公示年月日	
public_notice_number	公示番号	
landslide_area	指定面積（ha）	
prefecture_name	都道府県名	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT022?response_format=geojson&z=11&x=1815&y=805
GeoJSON形式　XYZ方式で該当するエリアの国土数値情報（急傾斜地崩壊危険区域）のGISデータを取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT022?response_format=pbf&z=11&x=1815&y=805&prefectureCode=13&administrativeAreaCode=13205
バイナリベクトルタイル形式　XYZ方式で該当するエリアのうち、東京都青梅市の国土数値情報（急傾斜地崩壊危険区域）のGISデータを取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


28. 都市計画決定GISデータ（地区計画）API
下記パラメータを指定することで、都市計画決定GISデータ（地区計画）を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT023?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
plan_name	計画名	
plan_type_ja	計画区分名	
kubun_id	区分コード	
group_code	行政コード	
decision_date	設定年月日	最終告示日
decision_type_ja	設定区分名	
decision_maker	設定者名	
notice_number	告示番号	告示番号L（告示番号（最終））
prefecture	都道府県名	
city_name	市町村名	
first_decision_date	当初決定日	
notice_number_s	告示番号S	告示番号（当初）
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT023?response_format=geojson&z=12&x=3657&y=1504
GeoJSON形式　XYZ方式で該当するエリアの都市計画決定GISデータ（地区計画）を取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT023?response_format=pbf&z=12&x=3657&y=1504
バイナリベクトルタイル形式　XYZ方式で該当するエリアの都市計画決定GISデータ（地区計画）を取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


29. 都市計画決定GISデータ（高度利用地区）API
下記パラメータを指定することで、都市計画決定GISデータ（高度利用地区）を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT024?＜パラメータ＞

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
advanced_name	高度名称	
advanced_type_ja	高度区分名	
kubun_id	区分コード	
group_code	行政コード	
decision_date	設定年月日	最終告示日
decision_type_ja	設定区分名	
decision_maker	設定者名	
notice_number	告示番号	告示番号L（告示番号（最終））
prefecture	都道府県名	
city_name	市町村名	
first_decision_date	当初決定日	
notice_number_s	告示番号S	告示番号（当初）
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT024?response_format=geojson&z=12&x=3637&y=1612
GeoJSON形式　XYZ方式で該当するエリアの都市計画決定GISデータ（高度利用地区）を取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT024?response_format=pbf&z=12&x=3637&y=1612
バイナリベクトルタイル形式　XYZ方式で該当するエリアの都市計画決定GISデータ（高度利用地区）を取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）


30. 国土交通省都市局（地形区分に基づく液状化の発生傾向図）API
下記パラメータを指定することで、地形区分に基づく液状化の発生傾向図を取得することができます。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT025?＜パラメータ＞

※APIで取得した情報を地図上で表示する場合のズームレベルは11（市）～15（詳細）で表示してください。
　ズームレベル１６以上で表示することは推奨されていません。

＜パラメータ＞
パラメータ	内容	備考	必須
response_format	応答形式	応答形式（GeoJSON応答／バイナリベクトルタイル応答）を設定
geojson…GeoJSON応答
pbf…バイナリベクトルタイル応答	○
z	ズームレベル（縮尺）	XYZ方式における、ズームレベル（縮尺）を指定。
11（市）～15（詳細）で指定可能であり、値が大きいほどズームレベルは高くなります（カバーする地理的領域は狭くなります）。	○
x	タイル座標のX値	XYZ方式における、タイル座標のX値を指定	○
y	タイル座標のY値	XYZ方式における、タイル座標のY値を指定	○
※XYZ方式の詳細については、https://maps.gsi.go.jp/development/tileCoordCheck.htmlを参照。
＜出力＞
出力形式：GeoJSON形式またはバイナリベクトルタイル形式

タグ名	内容	備考
mesh_code	メッシュコード	
topographic_classification_code	微地形区分（28区分）	
topographic_classification_name_ja	微地形区分の名称	
liquefaction_tendency_level	液状化発生傾向の強弱(6段階区分)	
note	説明	
＜使用例＞
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT025?response_format=geojson&z=11&x=1818&y=806
GeoJSON形式　XYZ方式で該当するエリアの地形区分に基づく液状化の発生傾向図を取得する。
https://www.reinfolib.mlit.go.jp/ex-api/external/XKT025?response_format=pbf&z=11&x=1818&y=806
バイナリベクトルタイル形式　XYZ方式で該当するエリアの地形区分に基づく液状化の発生傾向図を取得する。

＜出力例＞
GeoJSON形式またはバイナリベクトルタイル形式で出力されます。

・GeoJSON形式


・バイナリベクトルタイル形式（オープンソースのデスクトップ地理情報システムソフトウェアであるQGIS上での情報の表示イメージを示しています。）

