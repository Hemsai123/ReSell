import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { conversationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === parseInt(conversationId))
      if (conv) {
        setActiveConversation(conv)
        fetchMessages(conversationId)
      }
    }
  }, [conversationId, conversations])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await conversationsAPI.getAll()
      setConversations(res.data.results || res.data)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
    try {
      const res = await conversationsAPI.getMessages(convId)
      setMessages(res.data)
      await conversationsAPI.markRead(convId)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const handleSelectConversation = (conv) => {
    navigate(`/messages/${conv.id}`)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!messageInput.trim() && !selectedImage) || sending || !activeConversation) return

    const text = messageInput.trim()
    const image = selectedImage
    setMessageInput('')
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setSending(true)

    try {
      await conversationsAPI.sendMessage(activeConversation.id, text, image)
      await fetchMessages(activeConversation.id)
      await fetchConversations()
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessageInput(text)
      setSelectedImage(image)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await conversationsAPI.deleteMessage(activeConversation.id, messageId)
      await fetchMessages(activeConversation.id)
      await fetchConversations()
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const getOtherUser = (conv) => {
    if (!conv || !user) return null
    return conv.other_user
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  return (
    <div className="container" style={styles.page}>
      <motion.h2
        style={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Messages
      </motion.h2>
      <div style={styles.layout}>
        <motion.div
          style={styles.sidebar}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {conversations.length === 0 ? (
            <div style={styles.emptySidebar}>
              <p>No messages yet.</p>
              <p style={styles.emptyHint}>Contact a seller to start a conversation.</p>
            </div>
          ) : (
            conversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  ...styles.conversationItem,
                  ...(activeConversation?.id === conv.id ? styles.activeConversation : {})
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: '#f8f9fa' }}
              >
                <div style={styles.convContent}>
                  <div style={styles.convHeader}>
                    <span style={styles.convName}>{getOtherUser(conv)?.username || 'Unknown'}</span>
                    <span style={styles.convTime}>{conv.last_message ? formatTime(conv.last_message.created) : ''}</span>
                  </div>
                  <div style={styles.convProduct}>{conv.product?.name}</div>
                  <div style={styles.convLastMessage}>
                    {conv.last_message?.message || (conv.last_message?.image ? '📷 Photo' : 'No messages yet')}
                  </div>
                </div>
                <AnimatePresence>
                  {conv.unread_count > 0 && (
                    <motion.span
                      style={styles.unreadBadge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      {conv.unread_count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div
          style={styles.chatArea}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {activeConversation ? (
            <>
              <motion.div
                style={styles.chatHeader}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <strong>{getOtherUser(activeConversation)?.username}</strong>
                  <div style={styles.chatProduct}>{activeConversation.product?.name}</div>
                </div>
              </motion.div>

              <div style={styles.messagesList}>
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <div style={styles.noMessages}>No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        style={{
                          ...styles.messageBubble,
                          ...(msg.sender_id === user?.id ? styles.myMessage : styles.theirMessage)
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                      >
                        {msg.image_url && (
                          <motion.img
                            src={msg.image_url}
                            alt=""
                            style={styles.messageImage}
                            whileHover={{ scale: 1.02 }}
                          />
                        )}
                        {msg.message && <div style={styles.messageText}>{msg.message}</div>}
                        <div style={styles.messageFooter}>
                          <span style={styles.messageTime}>{formatTime(msg.created)}</span>
                          {msg.sender_id === user?.id && (
                            <motion.button
                              onClick={() => handleDeleteMessage(msg.id)}
                              style={styles.deleteBtn}
                              title="Delete message"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                            >
                              🗑️
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    style={styles.imagePreview}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                    <motion.button
                      onClick={() => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      style={styles.removeImageBtn}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form
                onSubmit={handleSendMessage}
                style={styles.messageForm}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.imageBtn}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  📷
                </motion.button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  style={styles.messageInput}
                  disabled={sending}
                />
                <motion.button
                  type="submit"
                  disabled={sending || (!messageInput.trim() && !selectedImage)}
                  style={styles.sendBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sending ? '...' : 'Send'}
                </motion.button>
              </motion.form>
            </>
          ) : (
            <motion.div
              style={styles.noChatSelected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={styles.noChatIcon}>&#128172;</div>
              <p>Select a conversation to start messaging</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

const styles = {
  page: { paddingTop: '24px', paddingBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: '#1a1a2e' },
  layout: { display: 'flex', gap: '20px', height: 'calc(100vh - 180px)', minHeight: '500px' },
  sidebar: { width: '300px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', flexShrink: 0 },
  emptySidebar: { padding: '40px 20px', textAlign: 'center', color: '#636e72' },
  emptyHint: { fontSize: '13px', marginTop: '8px', color: '#b2bec3' },
  conversationItem: { padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  activeConversation: { backgroundColor: '#f8f9fa' },
  convContent: { flex: 1, minWidth: 0 },
  convHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  convName: { fontWeight: 600, fontSize: '14px', color: '#1a1a2e' },
  convTime: { fontSize: '11px', color: '#b2bec3' },
  convProduct: { fontSize: '12px', color: '#636e72', marginBottom: '4px' },
  convLastMessage: { fontSize: '13px', color: '#636e72', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  unreadBadge: { backgroundColor: '#e94560', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, marginLeft: '8px' },
  chatArea: { flex: 1, backgroundColor: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
  chatHeader: { padding: '14px 20px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#1a1a2e', color: '#fff' },
  chatProduct: { fontSize: '13px', color: '#b2bec3', marginTop: '2px' },
  messagesList: { flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8f9fa' },
  noMessages: { textAlign: 'center', color: '#b2bec3', padding: '40px 0' },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: '16px', wordWrap: 'break-word' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#e94560', color: '#fff', borderBottomRightRadius: '4px' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#e9ecef', color: '#1a1a2e', borderBottomLeftRadius: '4px' },
  messageText: { fontSize: '14px', lineHeight: 1.4 },
  messageImage: { maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer' },
  messageFooter: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
  messageTime: { fontSize: '10px', opacity: 0.7 },
  deleteBtn: { background: 'none', fontSize: '12px', cursor: 'pointer', opacity: 0.7, padding: '2px' },
  imagePreview: { position: 'relative', padding: '10px 20px', backgroundColor: '#fff', borderTop: '1px solid #f0f0f0' },
  previewImage: { maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' },
  removeImageBtn: { position: 'absolute', top: '10px', left: '120px', backgroundColor: '#e94560', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  messageForm: { display: 'flex', gap: '10px', padding: '14px 20px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fff' },
  imageBtn: { backgroundColor: '#f8f9fa', padding: '10px 14px', borderRadius: '20px', fontSize: '18px' },
  messageInput: { flex: 1, padding: '10px 16px', border: '2px solid #e9ecef', borderRadius: '20px', fontSize: '14px', backgroundColor: '#f8f9fa' },
  sendBtn: { backgroundColor: '#e94560', color: '#fff', padding: '10px 20px', borderRadius: '20px', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)' },
  noChatSelected: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b2bec3' },
  noChatIcon: { fontSize: '48px', marginBottom: '16px', opacity: 0.5 },
}
