/* ================= TRIGGER CODES =================
  Block Events:
    10 = Block start

  Baseline 2min:
  5 = Baseline start
  6 = Baseline end

  Stimulus Onset:
    21 = Sustainable product shown
    22 = Unsustainable product shown

  Response:
    31 = Add to Cart (sustainable)
    32 = Add to Cart (unsustainable)
    33 = Skip (sustainable)measure stimulus-to-marker latency (true ERP timing)
    34 = Skip (unsustainable)

  Budget:
    41 = Insufficient budget (blocked purchase)

  Checkout:
    50 = Checkout screen shown
    51 = Feedback screen shown (sustainable majority)
    52 = Feedback screen shown (unsustainable majority)
================================================== */

/* ================= LSL WEBSOCKET ================= */
/*
const lsl = {
  socket: null,
  ready: false,

  connect() {
    return new Promise((resolve, reject) => {
      // Close any existing socket before retrying
      if (this.socket) {
        this.socket.onopen = null;
        this.socket.onerror = null;
        this.socket.onclose = null;
        this.socket.close();
        this.socket = null;
      }

      this.ready = false;
      let settled = false;

      this.socket = new WebSocket("ws://127.0.0.1:5001");

      this.socket.onopen = () => {
        settled = true;
        console.log("LSL WebSocket connected");
        this.ready = true;
        resolve();
      };

      this.socket.onerror = () => {
        if (settled) return;
        settled = true;
        console.error("LSL WebSocket error");
        reject(new Error("WebSocket connection failed"));
      };

      this.socket.onclose = () => {
        if (!settled) {
          // Connection was never established
          settled = true;
          reject(new Error("WebSocket closed before connecting"));
        } else {
          // Was connected but dropped mid-session
          console.warn("LSL WebSocket closed");
        }
        this.ready = false;
      };
    });
  },

  sendMarker(value) {
    if (
      this.ready &&
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      this.socket.send(JSON.stringify({ marker: String(value) }));
    } else {
      console.warn("LSL socket not ready — marker dropped:", value);
    }
  },

  disconnect() {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
    }
  },
};

*/

/* ================= LSL STUB ================= */

const lsl = {
  ready: true,
  connect() {
    this.ready = true;
    return Promise.resolve();
  },
  sendMarker(value) {
    console.log("[LSL stub] marker:", value);
  },
  disconnect() {
    this.ready = false;
  },
};

/* ================= PARTICIPANT ================= */

let participant_id = "";

/* ================= INIT JSPsych ================= */

const jsPsych = initJsPsych({
  on_finish: function () {
    lsl.disconnect();
    const filename = "ERP_" + participant_id + "_" + Date.now() + ".csv";
    jsPsych.data.get().localSave("csv", filename);
  },
});

let timeline = [];

/* ================= LSL CONNECT TRIAL ================= */

/*
function showLSLConnecting() {
  const el = document.querySelector(".jspsych-content");
  if (el)
    el.innerHTML = `
    <div style="text-align:center;font-family:'Jost',sans-serif">
      <p style="font-size:15px;color:#555;letter-spacing:0.05em">
        Connecting to LSL marker server…
      </p>
    </div>`;
}

function showLSLError(retryFn, skipFn) {
  const el = document.querySelector(".jspsych-content");
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:center;font-family:'Jost',sans-serif;max-width:420px;margin:0 auto">
      <p style="color:#c0392b;font-size:15px;margin-bottom:8px">
        ⚠️ Could not connect to LSL server
      </p>
      <p style="color:#777;font-size:13px;margin-bottom:24px">
        Make sure <strong>lsl_ws_server.py</strong> is running on
        <code>ws://127.0.0.1:5001</code>, then retry.
      </p>
      <button id="lsl-retry-btn" style="
        margin-right:12px;padding:9px 22px;
        background:#222;color:#fff;border:none;
        font-family:'Jost',sans-serif;font-size:13px;
        letter-spacing:0.08em;cursor:pointer">
        RETRY
      </button>
      <button id="lsl-skip-btn" style="
        padding:9px 22px;background:transparent;
        color:#999;border:1px solid #ccc;
        font-family:'Jost',sans-serif;font-size:13px;
        letter-spacing:0.08em;cursor:pointer">
        SKIP (no EEG triggers)
      </button>
    </div>`;

  document.getElementById("lsl-retry-btn").onclick = retryFn;
  document.getElementById("lsl-skip-btn").onclick = skipFn;
}

timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `<p style="font-family:'Jost',sans-serif;color:#555;letter-spacing:0.05em">
               Connecting to LSL marker server…</p>`,
  choices: [],

  on_load: function () {
    function attempt() {
      showLSLConnecting();
      lsl
        .connect()
        .then(() => {
          jsPsych.finishTrial(); // connected — advance automatically
        })
        .catch(() => {
          showLSLError(
            attempt, // retry button
            () => jsPsych.finishTrial(), // skip button — experiment runs without triggers
          );
        });
    }
    attempt();
  },
});
*/

/* ================= PARTICIPANT FORM ================= */

timeline.push({
  type: jsPsychSurveyHtmlForm,
  html: `
    <div style="font-family:'Jost',sans-serif;text-align:center;max-width:400px;margin:0 auto">
      <h3 style="letter-spacing:0.1em">Participant Information</h3>
      <p>Enter Participant ID:</p>
      <input name="participant" type="text" required
        style="padding:8px 14px;font-size:15px;border:1px solid #ccc;
               font-family:'Jost',sans-serif;width:200px"/>
    </div>
  `,
  on_finish: function (data) {
    participant_id = data.response.participant;
    jsPsych.data.addProperties({ participant_id: participant_id });
  },
});

/* ================= BASELINE INSTRUCTION ================= */
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="text-align:center">
      <p>Baseline recording will begin.</p>
      <p>Please stay still and focus on the cross.</p>
    </div>
  `,
  choices: ["Start Baseline"],
});

/* ================= BASELINE (2 MIN) ================= */
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      height:80vh;
      font-size:48px;">
      +
    </div>
  `,
  choices: "NO_KEYS",
  trial_duration: 120000,

  on_start: function () {
    lsl.sendMarker(5); // baseline start
  },

  on_finish: function () {
    lsl.sendMarker(6); // baseline end
  },
});

/* ================= INSTRUCTIONS ================= */

timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-family:'Jost',sans-serif;text-align:center;max-width:480px;margin:0 auto">
      <h2 style="letter-spacing:0.1em">Shopping Task</h2>
      <p>You have <strong>₹2000</strong> budget per block.</p>
      <p>You have <strong>60 seconds</strong> per block.</p>
      <p>Browse products and add items to your cart before time runs out.</p>
    </div>
  `,
  choices: ["Start"],
});

/* ================= PRODUCT IMAGES ================= */

function productImages(type, index) {
  return [1, 2, 3, 4].map((n) => `images/${type}_${index}_${n}.jpg`);
}

/* ================= PRODUCT LIST ================= */

function randomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sustainableProducts = [
  "Organic Cotton T-Shirt",
  "Hemp Fabric Summer Dress",
  "Bamboo Fiber Leggings",
  "Recycled Polyester Activewear Top",
  "Organic Linen Blouse",
  "Recycled Denim Jeans",
  "Bamboo Sports Bra",
  "Organic Cotton Pajama Set",
  "Eco Friendly Yoga Pants",
  "Hemp Crop Top",
  "Organic Cotton Hoodie",
  "Recycled Fabric Skirt",
  "Sustainable Maxi Dress",
  "Organic Cotton Tank Top",
  "Hemp Casual Shirt",
  "Bamboo Lounge Pants",
  "Recycled Polyester Jacket",
  "Organic Cotton Shorts",
  "Eco Linen Wrap Dress",
  "Hemp Summer Skirt",
  "Bamboo Sleepwear Set",
  "Organic Cotton Cardigan",
  "Recycled Fabric Blazer",
  "Hemp Knit Sweater",
  "Bamboo Camisole",
  "Organic Cotton Sweatshirt",
  "Eco Sports Leggings",
  "Recycled Denim Jacket",
  "Hemp Button Shirt",
  "Organic Cotton Jumpsuit",
  "Bamboo Workout Tank",
  "Sustainable Knit Dress",
  "Hemp Wide Leg Pants",
  "Organic Cotton Tunic",
  "Bamboo Casual Tee",
  "Eco Linen Pants",
  "Hemp Hoodie",
  "Organic Cotton Polo Shirt",
  "Recycled Raincoat",
  "Bamboo Capri Leggings",
  "Organic Wrap Top",
  "Hemp Tank Dress",
  "Bamboo Relaxed Shirt",
  "Organic Cotton Joggers",
  "Eco Linen Blazer",
  "Hemp Knit Top",
  "Bamboo Summer Dress",
  "Recycled Sweater",
  "Organic Crop Hoodie",
  "Hemp Beach Dress",
  "Bamboo Yoga Shorts",
  "Organic Knit Skirt",
  "Eco Linen Shirt Dress",
  "Hemp Sport Shorts",
  "Bamboo Ribbed Tank",
  "Organic Long Sleeve Tee",
  "Hemp Lightweight Jacket",
  "Bamboo Travel Dress",
  "Organic Palazzo Pants",
  "Eco Linen Tunic",
  "Hemp Everyday Dress",
  "Bamboo Relaxed Pants",
  "Organic Knit Dress",
  "Recycled Windbreaker",
  "Hemp Office Blouse",
  "Bamboo Fitness Top",
  "Organic Athleisure Set",
  "Eco Linen Midi Dress",
  "Hemp Casual Blazer",
  "Bamboo Soft Hoodie",
  "Organic Yoga Top",
  "Recycled Vest",
  "Hemp Lounge Set",
  "Bamboo Everyday Tee",
  "Organic Cotton Summer Dress",
];

const unsustainableProducts = [
  "Polyester Party Dress",
  "Synthetic Leather Mini Skirt",
  "Cheap Nylon Leggings",
  "Acrylic Knit Sweater",
  "Fast Fashion Crop Top",
  "Synthetic Lace Top",
  "Faux Leather Pants",
  "Polyester Blazer",
  "Acrylic Cardigan",
  "Fast Fashion Denim Shorts",
  "Synthetic Satin Dress",
  "Nylon Sports Bra",
  "Polyester Tank Top",
  "Acrylic Winter Scarf",
  "Fast Fashion Hoodie",
  "Synthetic Fur Jacket",
  "Polyester Maxi Dress",
  "Acrylic Knit Dress",
  "Faux Leather Jacket",
  "Polyester Office Shirt",
  "Nylon Yoga Pants",
  "Fast Fashion Wrap Dress",
  "Acrylic Crop Sweater",
  "Polyester Bodycon Dress",
  "Synthetic Leather Shorts",
  "Nylon Activewear Top",
  "Polyester Pleated Skirt",
  "Acrylic Turtleneck Sweater",
  "Fast Fashion Party Top",
  "Polyester Casual Dress",
  "Faux Leather Leggings",
  "Acrylic Winter Coat",
  "Nylon Workout Shorts",
  "Polyester Evening Gown",
  "Synthetic Satin Blouse",
  "Acrylic Pullover Sweater",
  "Fast Fashion Jumpsuit",
  "Polyester Summer Dress",
  "Nylon Camisole",
  "Faux Leather Mini Dress",
  "Acrylic Knit Cardigan",
  "Polyester Crop Jacket",
  "Synthetic Mesh Top",
  "Fast Fashion Denim Jacket",
  "Acrylic Party Sweater",
  "Polyester Track Pants",
  "Nylon Sports Tank",
  "Faux Leather Corset Top",
  "Polyester Night Dress",
  "Synthetic Velvet Dress",
  "Acrylic Lounge Pants",
  "Fast Fashion T-Shirt Dress",
  "Polyester Blouse",
  "Nylon Running Tights",
  "Acrylic Oversized Sweater",
  "Faux Leather Pencil Skirt",
  "Polyester Hoodie",
  "Synthetic Glitter Dress",
  "Acrylic Knit Vest",
  "Fast Fashion Tube Top",
  "Polyester Pleated Dress",
  "Nylon Biker Shorts",
  "Acrylic Winter Dress",
  "Faux Leather Cropped Jacket",
  "Polyester Athletic Jacket",
  "Synthetic Chiffon Dress",
  "Acrylic Knit Top",
  "Fast Fashion Bodycon Skirt",
  "Polyester Casual Blazer",
  "Nylon Workout Leggings",
  "Faux Leather Party Dress",
  "Acrylic Knit Scarf",
  "Polyester Festival Top",
  "Synthetic Party Gown",
];

const items = [];

sustainableProducts.forEach((name, i) => {
  items.push({
    name: name,
    price: randomPrice(699, 1299),
    type: "sustainable",
    images: productImages("sustainable", i + 1),
  });
});

unsustainableProducts.forEach((name, i) => {
  items.push({
    name: name,
    price: randomPrice(159, 359),
    type: "unsustainable",
    images: productImages("unsustainable", i + 1),
  });
});

/* ================= PRODUCT CARD ================= */

function productCard(item, block_number, budget) {
  return `
<div class="product-container">
  <div class="gallery">
    <div class="thumbnails">
      <img src="${item.images[0]}">
      <img src="${item.images[1]}">
      <img src="${item.images[2]}">
      <img src="${item.images[3]}">
    </div>
    <div class="main-image">
      <img src="${item.images[0]}" id="mainImage">
    </div>
  </div>
  <div class="product-info">
    <div class="brand">MAISON ATELIER</div>
    <div class="title">${item.name}</div>
    <div class="subtitle">Block ${block_number}</div>
    <div class="price">₹${item.price}</div>
    <p>Budget remaining: ₹${budget}</p>
    <div id="timer" style="font-size:20px;color:red;margin-bottom:12px"></div>
    <h4>COLOUR</h4>
    <div class="colours">
      <div class="colour" style="background:#c4b8a3"></div>
      <div class="colour" style="background:#7d6a54"></div>
      <div class="colour" style="background:#2e3440"></div>
    </div>
    <h4>SIZE</h4>
    <div class="size-row">
      <div class="size">XS</div>
      <div class="size">S</div>
      <div class="size">M</div>
      <div class="size">L</div>
      <div class="size">XL</div>
    </div>
    <div class="wishlist">Save to wishlist</div>
    <div class="meta">
      <div><b>Material</b><br>70% Cashmere</div>
      <div><b>Care</b><br>Dry clean only</div>
    </div>
  </div>
</div>
`;
}

/* ================= BLOCK FUNCTION ================= */

function createBlock(block_number) {
  let budget = 2000;
  let block_end_time = null;
  let timer_interval = null;
  let time_is_up = false;

  // IMPORTANT: use a plain object so the same reference is
  // shared between product trials, checkout, and feedback
  const state = { selected: [] };

  const shuffled = jsPsych.randomization.shuffle([...items]);

  /* ---- single product trial ---- */
  function makeProductTrial(item) {
    return {
      type: jsPsychHtmlButtonResponse,

      stimulus: function () {
        return productCard(item, block_number, budget);
      },

      choices: ["Add to Cart", "Skip"],

      on_start: function () {
        lsl.sendMarker(item.type === "sustainable" ? 21 : 22);
      },

      on_load: function () {
        const timerEl = document.getElementById("timer");
        timer_interval = setInterval(function () {
          const remaining = Math.ceil(
            (block_end_time - performance.now()) / 1000,
          );
          if (remaining <= 0) {
            clearInterval(timer_interval);
            time_is_up = true;
            jsPsych.finishTrial();
          } else if (timerEl) {
            timerEl.textContent = "Time Left: " + remaining + "s";
          }
        }, 250);
      },

      on_finish: function (data) {
        if (timer_interval) {
          clearInterval(timer_interval);
          timer_interval = null;
        }

        const isSustainable = item.type === "sustainable";
        const addedToCart = data.response === 0;
        const canAfford = budget >= item.price;

        if (addedToCart && canAfford) {
          budget -= item.price;
          state.selected.push(item);
          data.selected = 1;
          lsl.sendMarker(isSustainable ? 31 : 32);
        } else {
          data.selected = 0;
          if (addedToCart && !canAfford) {
            lsl.sendMarker(41);
          } else {
            lsl.sendMarker(isSustainable ? 33 : 34);
          }
        }

        data.block = block_number;
        data.item = item.name;
        data.price = item.price;
        data.sustainability = item.type;
        data.budget_remaining = budget;
        data.timestamp = Date.now();
      },
    };
  }

  /* ---- wrap each trial in a conditional so time-up skips remaining products
         but DOES NOT skip checkout or feedback                              ---- */
  const productTrials = shuffled.map(function (item) {
    return {
      timeline: [makeProductTrial(item)],
      conditional_function: function () {
        return !time_is_up;
      },
    };
  });

  return {
    timeline: [
      /* ---- BLOCK START ---- */
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
          <div style="font-family:'Jost',sans-serif;text-align:center">
            <h2 style="letter-spacing:0.1em">Block ${block_number}</h2>
            <p style="color:#555">You have <strong>60 seconds</strong> to shop.</p>
            <p style="color:#555">Budget: <strong>₹2000</strong></p>
          </div>
        `,
        choices: ["Begin"],
        on_start: function () {
          // Reset block state
          budget = 2000;
          time_is_up = false;
          state.selected = [];
          lsl.sendMarker(10);
        },
        on_finish: function () {
          block_end_time = performance.now() + 60000;
        },
      },

      /* ---- PRODUCT TRIALS (each wrapped in conditional) ---- */
      ...productTrials,

      /* ---- CHECKOUT — always runs, no conditional ---- */
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: function () {
          const sel = state.selected;
          const list =
            sel.length > 0
              ? sel
                  .map(
                    (i) => `
                <div style="display:flex;align-items:center;gap:14px;
                            padding:10px 0;border-bottom:1px solid #eee">
                  <img src="${i.images[0]}"
                       style="width:70px;height:90px;object-fit:cover;
                              border-radius:4px;flex-shrink:0"
                       onerror="this.style.display='none'">
                  <div>
                    <div style="font-weight:600;font-size:14px">${i.name}</div>
                    <div style="color:#888;font-size:13px;margin-top:4px">₹${i.price}</div>
                    <div style="font-size:12px;margin-top:4px;
                                color:${i.type === "sustainable" ? "#2e7d32" : "#c62828"}">

                    </div>
                  </div>
                </div>`,
                  )
                  .join("")
              : `<p style="color:#888;text-align:center;padding:20px 0">
                 No items were selected this block.
               </p>`;

          const total = sel.reduce((s, i) => s + i.price, 0);

          return `
            <div style="max-width:480px;margin:0 auto;font-family:'Jost',sans-serif">
              <h2 style="text-align:center;letter-spacing:0.08em">🛍️ Purchase Successful!</h2>
              <p style="text-align:center;color:#555;margin-bottom:16px">
                You have successfully purchased the following items:
              </p>
              <div style="max-height:340px;overflow-y:auto;
                          border:1px solid #eee;border-radius:6px;padding:0 12px">
                ${list}
              </div>
              ${
                sel.length > 0
                  ? `
              <div style="margin-top:14px;padding-top:12px;border-top:2px solid #ddd;
                          display:flex;justify-content:space-between;
                          font-weight:600;font-size:15px">
                <span>${sel.length} item(s)</span>
                <span>Total: ₹${total}</span>
              </div>`
                  : ""
              }
            </div>
          `;
        },
        choices: ["Continue"],
        on_start: function () {
          lsl.sendMarker(50);
        },
      },

      /* ---- FEEDBACK — always runs, no conditional ---- */
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: function () {
          const sel = state.selected;
          const s_count = sel.filter((i) => i.type === "sustainable").length;
          const us_count = sel.length - s_count;
          const majority = s_count >= us_count;
          const image = majority
            ? "images/feedback_sustainable.png"
            : "images/feedback_unsustainable.png";
          const message = majority
            ? `<p style="color:#2e7d32;font-size:15px;margin:0">
                🌿 Great choices! You mostly selected <strong>sustainable</strong>
                products. Your shopping habits help protect the environment.</p>`
            : `<p style="color:#c62828;font-size:15px;margin:0">
                ⚠️ You mostly selected <strong>unsustainable</strong> products.
                Consider choosing eco-friendly options next time.</p>`;

          return `
            <div style="max-width:480px;margin:0 auto;
                        font-family:'Jost',sans-serif;text-align:center">
              <h2 style="letter-spacing:0.08em">Your Shopping Impact</h2>
              <img src="${image}"
                   style="width:100%;max-width:420px;height:240px;
                          object-fit:cover;border-radius:8px;margin:12px 0"
                   onerror="this.style.display='none'">
              <div style="text-align:left;background:#f9f9f9;
                          padding:16px;border-radius:6px;margin-top:8px">
                ${message}
                <p style="color:#666;font-size:13px;margin-top:10px;margin-bottom:0">
                  🌿 Sustainable: <strong>${s_count}</strong> &nbsp;|&nbsp;
                  ⚠️ Unsustainable: <strong>${us_count}</strong>
                </p>
              </div>
            </div>
          `;
        },
        choices: ["Next Block"],
        on_start: function () {
          const sel = state.selected;
          const s_count = sel.filter((i) => i.type === "sustainable").length;
          const us_count = sel.length - s_count;
          lsl.sendMarker(s_count >= us_count ? 51 : 52);
        },
      },
    ],
  };
}

/* ================= MULTIPLE BLOCKS ================= */

for (let b = 1; b <= 20; b++) {
  timeline.push(createBlock(b));
}

/* ================= RUN ================= */

jsPsych.run(timeline);
