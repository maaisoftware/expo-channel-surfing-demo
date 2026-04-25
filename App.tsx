import { useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as Updates from 'expo-updates'

// =============================================================================
// Per-branch constants — the only thing each PR changes.
// main:               BG_COLOR = '#475569', BRANCH_LABEL = 'main'
// feat/blue-screen:   BG_COLOR = '#2563eb', BRANCH_LABEL = 'feat: blue screen'
// feat/red-screen:    BG_COLOR = '#dc2626', BRANCH_LABEL = 'feat: red screen'
// =============================================================================
const BG_COLOR = '#2563eb'
const BRANCH_LABEL = 'feat: blue screen'

export default function App() {
  const [pr, setPr] = useState('')
  const [error, setError] = useState<string | null>(null)
  const embeddedChannel = Updates.channel ?? '(none — running in dev / Expo Go)'

  const switchTo = async (channelName: string) => {
    setError(null)
    try {
      Updates.setUpdateRequestHeadersOverride({
        'expo-channel-name': channelName,
      })
      await Updates.reloadAsync()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const switchToPr = () => {
    const trimmed = pr.trim()
    if (!trimmed) {
      setError('Type a PR number first.')
      return
    }
    if (!/^\d+$/.test(trimmed)) {
      setError('PR number must be digits only.')
      return
    }
    void switchTo(`pr-${trimmed}`)
  }

  const switchToProduction = () => void switchTo('production')

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG_COLOR }]}>
      <StatusBar barStyle="light-content" />

      {/* Big colored hero — the bit that obviously differs per branch */}
      <View style={styles.body}>
        <Text style={styles.label}>Branch</Text>
        <Text style={styles.branch}>{BRANCH_LABEL}</Text>
        <Text style={styles.embedded}>Embedded channel: {embeddedChannel}</Text>
      </View>

      {/* Channel surfer — the no-backend variant from the blog post.
          Reader types a PR number, we override the expo-channel-name
          request header and reload the runtime. The same install. The
          same login state. A different bundle. */}
      <View style={styles.picker}>
        <Text style={styles.pickerTitle}>Channel surfer</Text>
        <Text style={styles.pickerHint}>
          Type a PR number to swap onto that branch&apos;s bundle.
        </Text>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={pr}
            onChangeText={(v) => {
              setPr(v)
              if (error) setError(null)
            }}
            placeholder="PR #"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Pressable style={styles.button} onPress={switchToPr}>
            <Text style={styles.buttonText}>Switch</Text>
          </Pressable>
        </View>

        <Pressable style={styles.resetButton} onPress={switchToProduction}>
          <Text style={styles.resetText}>Reset to production</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
    opacity: 0.7,
  },
  branch: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  embedded: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.55,
    marginTop: 24,
    fontFamily: 'Menlo',
  },
  picker: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pickerTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pickerHint: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  resetButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  resetText: { color: '#64748b', fontSize: 13 },
  error: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
})
