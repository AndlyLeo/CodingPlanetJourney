import { useWindowDimensions } from "react-native";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { width, height, fontScale } = useWindowDimensions();

  const isPhone = width < 600;
  const isWide = width >= 900;
  const isLandscape = width > height;

  const layoutName = isPhone
    ? "手機窄版"
    : isWide
      ? "大型平板版"
      : "小型平板版";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isPhone ? 16 : isWide ? 48 : 32,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              padding: isPhone ? 20 : 32,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                fontSize: isPhone ? 26 : 34,
              },
            ]}
          >
            普雷孔德
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                fontSize: isPhone ? 18 : 22,
              },
            ]}
          >
            Playcode Studio_兒童程式教育工作室
          </Text>

          <Text style={styles.description}>
            這是手機與平板響應式版面測試畫面。
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>目前裝置資料</Text>
          <Text style={styles.infoText}>螢幕寬度：{Math.round(width)} dp</Text>
          <Text style={styles.infoText}>螢幕高度：{Math.round(height)} dp</Text>
          <Text style={styles.infoText}>文字比例：{fontScale.toFixed(2)}</Text>
          <Text style={styles.infoText}>版面類型：{layoutName}</Text>
          <Text style={styles.infoText}>
            方向：{isLandscape ? "橫向" : "直向"}
          </Text>
        </View>

        <View
          style={[
            styles.contentArea,
            {
              flexDirection: isPhone ? "column" : "row",
              gap: isPhone ? 16 : 24,
            },
          ]}
        >
          <View style={[styles.panel, { flex: isPhone ? 0 : 1 }]}>
            <Text style={styles.panelTitle}>學習地圖</Text>
            <Text style={styles.panelText}>
              先確認這個區塊在手機上會上下排列，在平板上會左右排列。
            </Text>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>開始學習</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.panel, { flex: isPhone ? 0 : 1 }]}>
            <Text style={styles.panelTitle}>今日進度</Text>
            <Text style={styles.panelText}>
              今日已完成：2／6 關
            </Text>
            <Text style={styles.panelText}>
              今日使用時間：08／20 分鐘
            </Text>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>查看進度</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.blockTestArea}>
          <Text style={styles.panelTitle}>程式積木點擊測試</Text>

          <View
            style={[
              styles.blockRow,
              {
                flexDirection: isPhone ? "column" : "row",
              },
            ]}
          >
            <TouchableOpacity style={[styles.block, styles.moveBlock]}>
              <Text style={styles.blockText}>向前移動</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.block, styles.turnBlock]}>
              <Text style={styles.blockText}>向右轉</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.block, styles.loopBlock]}>
              <Text style={styles.blockText}>重複</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  scrollContent: {
    paddingVertical: 24,
    paddingBottom: 48,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    color: "#1A2B4C",
    fontWeight: "700",
  },
  subtitle: {
    color: "#007F64",
    fontWeight: "700",
    marginTop: 6,
  },
  description: {
    color: "#5C6B82",
    fontSize: 16,
    marginTop: 14,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: "#E8F8F3",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    color: "#007F64",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  infoText: {
    color: "#1A2B4C",
    fontSize: 16,
    lineHeight: 26,
  },
  contentArea: {
    marginBottom: 20,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    minHeight: 190,
  },
  panelTitle: {
    color: "#1A2B4C",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 12,
  },
  panelText: {
    color: "#5C6B82",
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#00C49A",
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#FFF3D2",
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#996700",
    fontSize: 18,
    fontWeight: "700",
  },
  blockTestArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  blockRow: {
    gap: 12,
  },
  block: {
    minHeight: 56,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  moveBlock: {
    backgroundColor: "#00C49A",
  },
  turnBlock: {
    backgroundColor: "#FFC857",
  },
  loopBlock: {
    backgroundColor: "#5F7CAC",
  },
  blockText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
